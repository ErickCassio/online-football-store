import React, { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import api from "../../utils/api";
import { jwtDecode } from "jwt-decode";
import { addItemToCart } from "../../utils/storage";

function Product() {
  const { productId } = useParams();
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [productDetails, setProductDetails] = useState({
    size: "",
    customization: "",
    customDetails: "",
  }); //Used to store the product details, as size, personalization, etc.
  const [sizes, setSizes] = useState(["S", "M", "L", "XL"]); //Others sizes are added later
  const [clickedIndex, setClickedIndex] = useState(null); //Used to set the button state

  const [finalPrice, setFinalPrice] = useState(0);
  const [productCount, setProductCount] = useState(1); //Product count to set how many products will be purchased
  const [decreaseCountState, setDecreaseCountState] = useState(true); //True for disabled, false for enabled

  const [measuresTable, setMeasuresTable] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]); //An array of binaries where each one represents a size chart

  const [logged, setLogged] = useState(false);

  const [errorMessage, setErrorMessage] = useState(""); // Store the message status
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Verifies if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          //Remove the token
          localStorage.removeItem("token");
        } else {
          setLogged(true);
        }
      } catch (error) {
        localStorage.removeItem("token");
      }
    }

    const searchProducts = async () => {
      try {
        const response = await api.get(`/searchById/${productId}`);
        //Look for the product ID on Database
        if (response.data.length > 0) {
          //If found the product, set the product info
          setProductInfo(response.data[0]);
        } else {
          //IF not found, send the client to error page
          console.log("No product found with the given ID");
          setProductInfo(null);
        }
      } catch (error) {
        //IF gets an error, send the client to error page
        console.error("Error fetching product:", error);
        setProductInfo(null);
      } finally {
        //If found the page, its load
        setLoading(false);
      }
    };
    searchProducts();
  }, []);

  useEffect(() => {
    if (!loading && productInfo === null) {
      //If the product was not found or do not exists
      <Navigate to="/page-not-found" />;
    } else if (!loading) {
      //Set the product price
      setFinalPrice(productInfo.price);
      //Set the product size
      if (
        productInfo.name.includes("Corta Vento") ||
        productInfo.name.includes("Jogador")
      ) {
        setSizes((prevSizes) => [...prevSizes, "2XL", "3XL"]);
      } else if (productInfo.name.includes("Torcedor")) {
        setSizes((prevSizes) => [...prevSizes, "2XL", "3XL", "4XL"]);
      } else if (productInfo.name.includes("Infantil")) {
        setSizes(["14", "16", "18", "20", "22", "24", "26", "28"]);
      }
    }
  }, [loading, productInfo]);

  const handleSizeButtonClick = (size, index) => {
    setClickedIndex(index);
    setProductDetails((prevProductDetails) => ({
      ...prevProductDetails, // Keep the old value
      size: size, // Define a new value for size
    }));
    setErrorMessage(""); // Clean the error message, to show nothing
  };

  const handleSelectChange = (event) => {
    setProductDetails((prevProductDetails) => ({
      ...prevProductDetails, //Keep the old value
      customization: event.target.value, // Define a new value for size
      customDetails: "", //Reset the aditional content for the product
    }));
    if (event.target.value === "") {
      //No personalization, default price
      setErrorMessage("");
      setFinalPrice(Number(productInfo.price));
    } else if (event.target.value === "Nome e número") {
      //With name and number personalization, +3 to the product price
      const nome_e_numero_price = 3;
      setFinalPrice(Number(productInfo.price) + nome_e_numero_price);
    } else {
      //With patch personalization, +2 to the product price
      const patchs_price = 2;
      setFinalPrice(Number(productInfo.price) + patchs_price);
    }
  };

  const handleInputChange = (event) => {
    setProductDetails((prevProductDetails) => ({
      ...prevProductDetails, //Keep the old value
      customDetails: event.target.value, // Defines the aditional content for the product
    }));
  };

  const decreaseCount = () => {
    setProductCount((prevCount) => {
      const newCount = prevCount - 1;
      if (newCount < 2) {
        setDecreaseCountState(true);
        return 1;
      }
      return newCount;
    });
  };
  const increaseCount = () => {
    setDecreaseCountState(false);
    setProductCount(productCount + 1);
  };

  const updateMeasureTableStatus = (indice, novoValor) => {
    setMeasuresTable((prevState) => {
      const novaMatriz = [...prevState]; // Create a copy to the original table
      novaMatriz[indice] = novoValor; // Change the value on the especific index
      return novaMatriz; // Return the new table with new value
    });
  };

  const onClickAddtoCart = async () => {
    if (productDetails.size === "") {
      //If the product size was not chosen, shows an error message
      setErrorMessage("*Escolha um tamanho");
    } else if (
      productDetails.customization !== "" &&
      productDetails.customDetails === ""
    ) {
      //When the client choose a customization but dont type nothing
      setErrorMessage("*Preencha o campo: " + productDetails.customization);
    } else {
      //Terminar de enviar o item pro carrinho (local)
      addItemToCart({
        ...{ productId: productInfo.id },
        ...productDetails,
        ...{ price: finalPrice, quantity: productCount },
      });
      //Envia o carrinho pro banco de dados
      if (logged) {
        const token = localStorage.getItem("token");
        const intPrice = Number(finalPrice);
        const allProductInfo = {
          ...{ productId: productInfo.id },
          ...productDetails,
          ...{ price: intPrice, quantity: productCount },
        };
        const addToCart = async () => {
          try {
            const response = await api.post(`/cart/${token}`, allProductInfo);
          } catch (error) {
            console.error(
              "Erro ao adicionar item ao carrinho:",
              error.response.data.error
            );
          }
        };
        await addToCart();
      }
      return navigate(`/cart`);
    }
  };

  return (
    <div>
      <Header />
      {loading ? (
        <div>
          {/* Creates a blank space to show while the page is loading */}
          <div style={{ height: "70vh" }}></div>
        </div>
      ) : (
        <div className="container productPage">
          <div className="row my-5">
            <div className="col-12 col-lg-6 col-md-6 pb-3">
              <img
                className="img-fluid px-3 productImage"
                src={productInfo.url}
                alt="Product"
              />
            </div>
            <div className="col-12 col-lg-6 col-md-6 px-4 productInfo">
              <h2>{productInfo.name}</h2>
              {/* Product name */}
              <h5 className="my-3">{"€" + finalPrice}</h5>
              {/* Product price */}

              <div className="d-flex">
                <p className="mb-1 me-2">
                  <b>Tamanho</b>
                </p>
                <span>{productDetails.size}</span>
              </div>
              {sizes.map((size, index) => (
                <button
                  className={
                    "px-3 py-2 me-2 mb-2 productButton " +
                    (clickedIndex === index ? "clicked" : "")
                  }
                  type="button"
                  onClick={() => handleSizeButtonClick(size, index)}
                >
                  <span className="px-1">{size}</span>
                </button>
              ))}

              <div>
                <label for="selectOption" className="mt-3 mb-1 col-12">
                  <b>Personalização</b>
                  <span className="ms-2">{productDetails.customization}</span>
                </label>
                <select
                  id="selectOption"
                  value={productDetails.customization}
                  onChange={handleSelectChange}
                  className="col-12"
                >
                  <option value="">Selecionar opção</option>
                  <option value="Nome e número">Nome e número + €3,00</option>
                  <option value="Patch's">Patch's + €2,00 cada</option>
                </select>
              </div>

              {productDetails.customization === "Nome e número" ? (
                <div>
                  <label
                    for="personalizationInput"
                    className="mt-3 mb-1 col-12"
                  >
                    <b>{productDetails.customization}</b>
                  </label>
                  <input
                    type="text"
                    name="personalizationInput"
                    placeholder="Ex.: JOÃO 10 (Será colocado exatamente como escrever aqui)"
                    className="col-12 px-3 py-1"
                    value={productDetails.customDetails}
                    onChange={handleInputChange}
                  />
                </div>
              ) : productDetails.customization === "Patch's" ? (
                <div>
                  <label
                    for="personalizationInput"
                    className="mt-3 mb-1 col-12"
                  >
                    <b>{productDetails.customization}</b>
                  </label>
                  <input
                    type="text"
                    name="personalizationInput"
                    placeholder="Coloque o nome do Patch aqui"
                    className="col-12 px-3 py-1"
                    value={productDetails.customDetails}
                    onChange={handleInputChange}
                  />
                </div>
              ) : null}

              <div className="mt-3">
                <p className="mb-1">
                  <b>Quantidade</b>
                </p>
                <div className="d-flex">
                  <button
                    className="quantity-button"
                    type="button"
                    disabled={decreaseCountState}
                    onClick={() => {
                      decreaseCount();
                    }}
                  >
                    -
                  </button>
                  <input
                    className="quantity-input text-center align-items-center"
                    type="number"
                    name=""
                    id=""
                    value={productCount}
                  />
                  <button
                    className="quantity-button"
                    type="button"
                    onClick={() => {
                      increaseCount();
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="d-flex align-items-center mt-3 measures">
                <svg
                  data-bs-toggle="modal"
                  data-bs-target="#measuresModal"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 60 60"
                >
                  <g fill="currentColor" clip-path="url(#ruler_svg__a)">
                    <path d="M24.832 29.334c3.903 0 7.074-2.447 7.074-5.46s-3.171-5.46-7.074-5.46c-3.904 0-7.075 2.447-7.075 5.46s3.171 5.46 7.075 5.46Zm-4.678-5.46c0-1.631 2.18-3.063 4.678-3.063 2.496 0 4.677 1.432 4.677 3.063 0 1.632-2.18 3.063-4.677 3.063-2.497 0-4.678-1.431-4.678-3.063Z"></path>
                    <path d="M39.63 32.855v-8.298c.016-.225.025-.458.025-.691 0-6.25-6.65-11.336-14.824-11.336-8.173 0-14.648 4.944-14.831 11.078v9.704c0 7.807 6.35 14.158 14.157 14.158h25.835V32.855h-10.37.008Zm4.211 6.891v5.327h-.924v-5.327H40.52v5.327h-.924v-7.524H37.2v7.524h-.923v-5.327h-2.398v5.327h-.923v-5.327h-2.397v5.327h-.924v-7.524h-2.397v7.524h-3.071c-6.484 0-11.76-5.277-11.76-11.76v-3.255c.257.308.549.608.848.9a13.95 13.95 0 0 0 2.073 1.622c1.548.982 3.304 1.706 5.226 2.156a18.78 18.78 0 0 0 2.206.366c1.581.166 3.188.166 4.736.158h20.108v9.821h-1.365v-5.327h-2.397v-.008ZM15.834 17.724c2.38-1.806 5.577-2.797 8.997-2.797 3.421 0 6.617.99 8.997 2.797 2.081 1.581 3.288 3.595 3.421 5.726h-.016v.949c-.175 2.08-1.382 4.078-3.413 5.61-2.38 1.805-5.576 2.796-8.997 2.796-3.42 0-6.617-.99-8.997-2.797-2.214-1.68-3.437-3.861-3.437-6.142 0-2.28 1.223-4.461 3.437-6.142h.008Zm21.399 12.368v2.763h-3.346c1.306-.774 2.438-1.706 3.346-2.763Z"></path>
                  </g>
                  <defs>
                    <clipPath id="ruler_svg__a">
                      <path fill="#fff" d="M10 12.53h40v34.94H10z"></path>
                    </clipPath>
                  </defs>
                </svg>
                <p data-bs-toggle="modal" data-bs-target="#measuresModal">
                  Tabela de medidas
                </p>
              </div>

              <div
                class="modal fade"
                id="measuresModal"
                tabindex="-1"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
              >
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h1 class="modal-title fs-2" id="exampleModalLabel">
                        Tabela de medidas
                      </h1>
                      <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      ></button>
                    </div>
                    <div class="modal-body">
                      <p class="note">
                        Considerar margem de erro de 1-3 cm em cada medida
                      </p>
                      <div className="measuresTable">
                        <div className="d-flex align-items-center">
                          <h4
                            onClick={() => {
                              updateMeasureTableStatus(0, !measuresTable[0]);
                            }}
                            className="m-0 me-1"
                          >
                            Torcedor
                          </h4>
                          <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <hr />
                        {measuresTable[0] ? (
                          <table className="table text-center">
                            <thead>
                              <tr>
                                <th>Tamanho</th>
                                <th>Comprimento (CM)</th>
                                <th>Largura (CM)</th>
                                <th>Altura (CM)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>S</td>
                                <td>69 - 71</td>
                                <td>53 - 55</td>
                                <td>162 - 170</td>
                              </tr>
                              <tr>
                                <td>M</td>
                                <td>71 - 73</td>
                                <td>55 - 57</td>
                                <td>170 - 176</td>
                              </tr>
                              <tr>
                                <td>L</td>
                                <td>73 - 75</td>
                                <td>57 - 58</td>
                                <td>176 - 182</td>
                              </tr>
                              <tr>
                                <td>XL</td>
                                <td>75 - 78</td>
                                <td>58 - 60</td>
                                <td>182 - 190</td>
                              </tr>
                              <tr>
                                <td>2XL</td>
                                <td>78 - 81</td>
                                <td>60 - 62</td>
                                <td>190 - 195</td>
                              </tr>
                              <tr>
                                <td>3XL</td>
                                <td>81 - 83</td>
                                <td>62 - 64</td>
                                <td>192 - 197</td>
                              </tr>
                              <tr>
                                <td>4XL</td>
                                <td>83 - 85</td>
                                <td>64 - 65</td>
                                <td>197 - 200</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : null}
                        <div className="d-flex align-items-center">
                          <h4
                            onClick={() => {
                              updateMeasureTableStatus(1, !measuresTable[1]);
                            }}
                            className="m-0 me-1"
                          >
                            Jogador
                          </h4>
                          <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <hr />
                        {measuresTable[1] ? (
                          <table className="table text-center">
                            <thead>
                              <tr>
                                <th>Tamanho</th>
                                <th>Comprimento (CM)</th>
                                <th>Largura (CM)</th>
                                <th>Altura (CM)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>S</td>
                                <td>67-69</td>
                                <td>49-51</td>
                                <td>162-170</td>
                              </tr>
                              <tr>
                                <td>M</td>
                                <td>69-71</td>
                                <td>51-53</td>
                                <td>170-175</td>
                              </tr>
                              <tr>
                                <td>L</td>
                                <td>71-73</td>
                                <td>51-55</td>
                                <td>175-180</td>
                              </tr>
                              <tr>
                                <td>XG</td>
                                <td>73-76</td>
                                <td>55-57</td>
                                <td>180-185</td>
                              </tr>
                              <tr>
                                <td>2XL</td>
                                <td>76-78</td>
                                <td>57-60</td>
                                <td>185-190</td>
                              </tr>
                              <tr>
                                <td>3XL</td>
                                <td>78-79</td>
                                <td>60-63</td>
                                <td>190-195</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : null}
                        <div className="d-flex align-items-center">
                          <h4
                            onClick={() => {
                              updateMeasureTableStatus(2, !measuresTable[2]);
                            }}
                            className="m-0 me-1"
                          >
                            Feminina
                          </h4>
                          <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <hr />
                        {measuresTable[2] ? (
                          <table className="table text-center">
                            <thead>
                              <tr>
                                <th>Tamanho</th>
                                <th>Comprimento (CM)</th>
                                <th>Largura (CM)</th>
                                <th>Altura (CM)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>S</td>
                                <td>61-63</td>
                                <td>40-41</td>
                                <td>150-160</td>
                              </tr>
                              <tr>
                                <td>M</td>
                                <td>63-66</td>
                                <td>41-44</td>
                                <td>160-165</td>
                              </tr>
                              <tr>
                                <td>L</td>
                                <td>66-69</td>
                                <td>44-47</td>
                                <td>165-170</td>
                              </tr>
                              <tr>
                                <td>XL</td>
                                <td>69-71</td>
                                <td>47-50</td>
                                <td>170-175</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : null}
                        <div className="d-flex align-items-center">
                          <h4
                            onClick={() => {
                              updateMeasureTableStatus(3, !measuresTable[3]);
                            }}
                            className="m-0 me-1"
                          >
                            Kit Infantil
                          </h4>
                          <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <hr />
                        {measuresTable[3] ? (
                          <table className="table text-center">
                            <thead>
                              <tr>
                                <th>Tamanho</th>
                                <th>Idade</th>
                                <th>Altura (cm)</th>
                                <th>Comprimento (cm)</th>
                                <th>Cintura (cm)</th>
                                <th>Largura (cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>14</td>
                                <td>2-3</td>
                                <td>85-95</td>
                                <td>41-44</td>
                                <td>33-35</td>
                                <td>19-36</td>
                              </tr>
                              <tr>
                                <td>16</td>
                                <td>3-4</td>
                                <td>95-105</td>
                                <td>44-47</td>
                                <td>35-37</td>
                                <td>20-37</td>
                              </tr>
                              <tr>
                                <td>18</td>
                                <td>4-5</td>
                                <td>105-115</td>
                                <td>47-50</td>
                                <td>37-39</td>
                                <td>21-39</td>
                              </tr>
                              <tr>
                                <td>20</td>
                                <td>5-6</td>
                                <td>115-125</td>
                                <td>50-53</td>
                                <td>39-41</td>
                                <td>22-41</td>
                              </tr>
                              <tr>
                                <td>22</td>
                                <td>6-7</td>
                                <td>125-135</td>
                                <td>53-56</td>
                                <td>41-43</td>
                                <td>23-42</td>
                              </tr>
                              <tr>
                                <td>24</td>
                                <td>8-9</td>
                                <td>135-145</td>
                                <td>56-59</td>
                                <td>43-45</td>
                                <td>24-44</td>
                              </tr>
                              <tr>
                                <td>26</td>
                                <td>10-11</td>
                                <td>145-155</td>
                                <td>59-62</td>
                                <td>45-47</td>
                                <td>25-47</td>
                              </tr>
                              <tr>
                                <td>28</td>
                                <td>12-13</td>
                                <td>155-165</td>
                                <td>62-65</td>
                                <td>47-49</td>
                                <td>26-50</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : null}
                        <div className="d-flex align-items-center">
                          <h4
                            onClick={() => {
                              updateMeasureTableStatus(4, !measuresTable[4]);
                            }}
                            className="m-0 me-1"
                          >
                            Corta-Vento
                          </h4>
                          <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <hr />
                        {measuresTable[4] ? (
                          <table className="table text-center">
                            <thead>
                              <tr>
                                <th>Tamanho</th>
                                <th>Comprimento (cm)</th>
                                <th>Largura (cm)</th>
                                <th>Peito (cm)</th>
                                <th>Altura (cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>S</td>
                                <td>67</td>
                                <td>51</td>
                                <td>106</td>
                                <td>165 - 170</td>
                              </tr>
                              <tr>
                                <td>M</td>
                                <td>69</td>
                                <td>52</td>
                                <td>110</td>
                                <td>170 - 175</td>
                              </tr>
                              <tr>
                                <td>L</td>
                                <td>71</td>
                                <td>53</td>
                                <td>114</td>
                                <td>175 - 180</td>
                              </tr>
                              <tr>
                                <td>XL</td>
                                <td>73</td>
                                <td>54</td>
                                <td>118</td>
                                <td>180 - 185</td>
                              </tr>
                              <tr>
                                <td>2XL</td>
                                <td>75</td>
                                <td>56</td>
                                <td>122</td>
                                <td>185 - 190</td>
                              </tr>
                              <tr>
                                <td>3XL</td>
                                <td>77</td>
                                <td>58</td>
                                <td>126</td>
                                <td>190 - 195</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : null}
                        <div className="d-flex align-items-center">
                          <h4
                            onClick={() => {
                              updateMeasureTableStatus(5, !measuresTable[5]);
                            }}
                            className="m-0 me-1"
                          >
                            NBA
                          </h4>
                          <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <hr />
                        {measuresTable[5] ? (
                          <table className="table text-center">
                            <thead>
                              <tr>
                                <th>Tamanho</th>
                                <th>Comprimento Frente</th>
                                <th>Comprimento Costas</th>
                                <th>Altura (cm)</th>
                                <th>Peito (cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>S</td>
                                <td>170 - 175</td>
                                <td>55 - 70</td>
                                <td>170 - 175</td>
                                <td>108</td>
                              </tr>
                              <tr>
                                <td>M</td>
                                <td>175 - 180</td>
                                <td>70 - 80</td>
                                <td>175 - 180</td>
                                <td>114</td>
                              </tr>
                              <tr>
                                <td>L</td>
                                <td>180 - 185</td>
                                <td>80 - 90</td>
                                <td>180 - 185</td>
                                <td>120</td>
                              </tr>
                              <tr>
                                <td>XL</td>
                                <td>185 - 190</td>
                                <td>90 - 100</td>
                                <td>185 - 190</td>
                                <td>126</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : null}
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button
                        type="button"
                        class="btn btn-secondary"
                        data-bs-dismiss="modal"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="add-to-cart-button py-2 px-4 mt-3"
                  onClick={onClickAddtoCart}
                >
                  Adicionar ao carrinho
                </button>
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default Product;
