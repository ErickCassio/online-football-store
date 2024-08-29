import React, { useEffect, useState } from "react";
import {
  getCartItems,
  removeItemFromCart,
  increaseItemQuantity,
  decreaseItemQuantity,
} from "../../utils/storage";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import api from "../../utils/api";
import { jwtDecode } from "jwt-decode";

const Cart = () => {
  const [tempCartItems, setTempCartItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decreaseCountState, setDecreaseCountState] = useState([]); //True for disabled, false for enabled
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [logged, setLogged] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setTempCartItems(getCartItems());
          setLoading(false);
        } else {
          setLogged(true);
          fetchCartFromBackend(token);
        }
      } catch (error) {
        localStorage.removeItem("token");
        setTempCartItems(getCartItems());
        setLoading(false);
      }
    } else {
      setTempCartItems(getCartItems());
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      try {
        let auxArray = [];
        let updatedCartItems = [];
        let auxTotalPrice = 0;
        let auxTotalProducts = 0;
        for (let i = 0; i < tempCartItems.length; i++) {
          const item = tempCartItems[i];
          auxTotalPrice +=
            Number(tempCartItems[i].price) * tempCartItems[i].quantity;
          auxTotalProducts += tempCartItems[i].quantity;
          if (tempCartItems[i].quantity > 1) {
            let auxCountState = decreaseCountState;
            auxCountState[i] = false;
            setDecreaseCountState(auxCountState);
          } else {
            let auxCountState = decreaseCountState;
            auxCountState[i] = true;
            setDecreaseCountState(auxCountState);
          }
          const response = await api.get(
            `/searchById/${tempCartItems[i].productId}`
          );
          if (response.data.length > 0) {
            const { id, ...productData } = response.data[0];
            auxArray.push(productData);
            updatedCartItems.push({ ...productData, ...item });
          } else {
            removeItemFromCart(i);
          }
        }
        setCartItems(updatedCartItems);
        setTotalPrice(auxTotalPrice);
        setTotalProducts(auxTotalProducts);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      } finally {
        if (isFirstLoad) {
          if (tempCartItems.length > 0) setLoading(false);
        } else {
          setLoading(false);
        }
      }
    };
    searchProducts();
    setIsFirstLoad(false);
  }, [tempCartItems]);

  const renameProperties = (item) => {
    return {
      ...item,
      productId: item.productid,
      customDetails: item.customdetails,
    };
  };

  const fetchCartFromBackend = async (token) => {
    try {
      const response = await api.get(`/cart/${token}`);
      const backendCartItems = response.data
        .map((item) => {
          const renamedItem = renameProperties(item);
          delete renamedItem.productid;
          delete renamedItem.customdetails;
          return {
            ...renamedItem,
            databaseItemId: item.id,
          };
        })
        .sort((a, b) => a.databaseItemId - b.databaseItemId); // Ordena pelo id em ordem crescente

      //setCartItems(backendCartItems);
      setTempCartItems(backendCartItems);
    } catch (error) {
      console.error("Error fetching cart from backend:", error);
      setCartItems(getCartItems());
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    if (logged) {
      try {
        const token = localStorage.getItem("token");
        const databaseItemId = cartItems[itemId].databaseItemId;
        await api.delete(`/cart/${token}/item/${databaseItemId}`);
        fetchCartFromBackend(token);
      } catch (error) {
        console.error("Error removing item from cart:", error);
      }
    } else {
      removeItemFromCart(itemId);
      setTempCartItems(getCartItems());
    }
    setLoading(false);
  };

  const increaseCount = async (index) => {
    if (logged) {
      try {
        const token = localStorage.getItem("token");
        const databaseItemId = cartItems[index].databaseItemId;
        const item = cartItems[index];
        await api.put(`/cart/${token}/item/${databaseItemId}`, {
          quantity: item.quantity + 1,
        });
        const updatedCartItems = [...cartItems];

        // Verifica se o índice é válido
        if (index >= 0 && index < updatedCartItems.length) {
          // Atualiza a quantidade do item especificado
          updatedCartItems[index].quantity += 1;
        }

        // Define o estado `tempCartItems` com o array atualizado
        setTempCartItems(updatedCartItems);
      } catch (error) {
        console.error("Error increasing item quantity:", error);
      }
    } else {
      increaseItemQuantity(index);
      setTempCartItems(getCartItems());
    }
    setLoading(false);
  };

  const decreaseCount = async (index) => {
    if (logged) {
      try {
        const token = localStorage.getItem("token");
        const databaseItemId = cartItems[index].databaseItemId;
        const item = cartItems[index];
        if (item.quantity > 1) {
          await api.put(`/cart/${token}/item/${databaseItemId}`, {
            quantity: item.quantity - 1,
          });
          const updatedCartItems = [...cartItems];

          // Verifica se o índice é válido
          if (index >= 0 && index < updatedCartItems.length) {
            // Atualiza a quantidade do item especificado
            updatedCartItems[index].quantity -= 1;
          }

          // Define o estado `tempCartItems` com o array atualizado
          setTempCartItems(updatedCartItems);
        }
      } catch (error) {
        console.error("Error decreasing item quantity:", error);
      }
    } else {
      decreaseItemQuantity(index);
      setTempCartItems(getCartItems());
    }
    setLoading(false);
  };

  const handleBuyAction = () => {
    if (logged) {
      sendWhatsAppMessage();
    } else {
      setShowModal(true);
    }
  };

  const formatCartItems = () => {
    let message = "Olá, gostaria de comprar os seguintes produtos:\n\n";
    cartItems.forEach((item) => {
      message += `https://zzfutebolstore.com/product/${item.productId}
*${item.name}*
Quantidade: ${item.quantity}
Tamanho: ${item.size}\n`;

      // Condicional para incluir personalização se não for uma string vazia
      if (item.customization && item.customization.trim().length > 0) {
        message += `Personalização: ${item.customization}\n`;
      }

      // Condicional para incluir detalhes da personalização se não for uma string vazia
      if (item.customDetails && item.customDetails.trim().length > 0) {
        message += `Detalhes (personalização): ${item.customDetails}\n`;
      }

      message += `Preço: *€${item.price * item.quantity}*\n\n`;
    });
    // Calcula o total original
    let totalAmount = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Calcula a quantidade total de itens no carrinho
    let totalItems = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Se a quantidade total de itens for menor que 3, aumenta o total em €5 (frete)
    if (totalItems < 3) {
      totalAmount += 5;
      message += `*Total: €${totalAmount} (Frete incluído)*`;
    } else {
      message += `*Total: €${totalAmount} (Frete grátis)*`;
    }

    return encodeURIComponent(message);
  };

  const sendWhatsAppMessage = () => {
    const phoneNumber = "+351935165523"; // Substitua pelo número de telefone
    const message = formatCartItems();
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <div>
      <Header />
      <div className="container-xxl cartPage">
        <h2 className="mx-4 my-4">Meu Carrinho</h2>
        {loading ? (
          <div>
            {/* Indicador de carregamento */}
            <div class="spinner-container">
              <div class="d-flex justify-content-center align-items-center">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
            <div style={{ height: "60vh" }}></div>
          </div>
        ) : tempCartItems.length === 0 ? (
          <div>
            <h4 className="mx-5 my-3">O carrinho está vazio.</h4>
            <div style={{ height: "40vh" }}></div>
          </div>
        ) : (
          <div className="row ms-4 my-3 me-2">
            <div className="col-12 col-lg-9 col-md-9">
              {cartItems.map((item, id) => (
                <div className="row py-2" key={item.id}>
                  <div
                    className="col-4 col-lg-3 col-md-4 p-2"
                    style={{ "background-color": "white" }}
                  >
                    <img className="img-fluid" src={item.url} alt="Product" />
                  </div>
                  <div
                    className="col-8 p-2"
                    style={{ "background-color": "white" }}
                  >
                    <h5
                      className="cart-item-title"
                      onClick={() => {
                        navigate(`/product/${item.productId}`);
                      }}
                    >
                      {item.name}
                    </h5>
                    <h6>€{item.price * item.quantity}</h6>
                    <p className="m-0">Tamanho: {item.size}</p>
                    {item.customization ? (
                      <div>
                        <p className="m-0">
                          Personalização: {item.customization}
                        </p>
                        <p className="m-0">
                          {item.customization}: {item.customDetails}
                        </p>
                      </div>
                    ) : (
                      <p className="m-0">Personalização: Sem personalização</p>
                    )}
                    <div className="d-flex mt-2">
                      <button
                        className="quantity-button"
                        type="button"
                        disabled={decreaseCountState[id]}
                        onClick={() => {
                          decreaseCount(id);
                        }}
                      >
                        -
                      </button>
                      <input
                        className="quantity-input text-center align-items-center"
                        type="number"
                        value={item.quantity}
                        readOnly
                      />
                      <button
                        className="quantity-button"
                        type="button"
                        onClick={() => {
                          increaseCount(id);
                        }}
                      >
                        +
                      </button>
                      <button
                        className="trash-button"
                        type="button"
                        onClick={() => {
                          handleRemoveFromCart(id);
                        }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-12 col-lg-3 col-md-3 p-2">
              <div className="cartDetails p-3">
                <span>
                  <h5>Subtotal ({totalProducts} produtos):</h5>
                  {totalProducts < 3 ? (
                    <h6>+5€ Frete</h6>
                  ) : (
                    <h6>- Frete grátis</h6>
                  )}
                  <h5>
                    <b>€{totalProducts < 3 ? totalPrice + 5 : totalPrice}</b>
                  </h5>
                </span>
                <button
                  className="cartBuyButton py-2 px-4 mt-2"
                  onClick={handleBuyAction}
                >
                  <i className="fa-solid fa-bag-shopping me-2"></i>Comprar
                </button>
              </div>
            </div>

            <div className="modal" tabIndex="-1" id="exampleModal">
              {/* Modal para confirmar que o produto foi removido */}
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-body d-flex justify-content-between align-items-center">
                    <p className="m-0">Produto removido do carrinho!</p>
                    <button
                      type="button"
                      className="btn btn-primary ms-5"
                      data-bs-dismiss="modal"
                    >
                      Ok
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`modal fade ${showModal ? "show d-block" : ""}`}
              tabIndex="-1"
              role="dialog"
              aria-labelledby="exampleModalLabel"
              aria-hidden={!showModal}
              style={{ display: showModal ? "block" : "none" }}
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">
                      Ação Necessária
                    </h5>
                  </div>
                  <div className="modal-body">
                    Você precisa fazer login para prosseguir com sua compra.
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        navigate(`/login`);
                      }}
                    >
                      Fazer Login
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowModal(false);
                      }}
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
