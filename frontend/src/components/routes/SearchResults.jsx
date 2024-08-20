import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

const imagesPerPage = 20;

function SearchResults() {
  const [currentPage, setCurrentPage] = useState(1);
  const [finalResult, setFinalResult] = useState([]);
  //Defines the search state, 0 if is searching, 1 if finds something, 2 if nothing was found
  const [pageState, setPageState] = useState(0);

  const [searchParams] = useSearchParams();
  const search = decodeURIComponent(searchParams.get("input"));

  const navigate = useNavigate();

  useEffect(() => {
    setPageState(0);
    const searchProducts = async () => {
      try {
        const response = await api.get(`/search/${search}`);
        const sortedProducts = response.data.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );
        if (sortedProducts.length === 0) {
          setPageState(2); //If no product is found
        } else {
          setPageState(1); //If everything is ok
        }
        setFinalResult(sortedProducts);
      } catch (error) {
        setPageState(2);
        console.log("No products found");
      }
    };

    searchProducts();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [search]);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 20 >=
      document.documentElement.offsetHeight
    ) {
      return loadMoreImages();
    }
  };

  const loadMoreImages = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handleProductClick = (searchResult) => {
    return navigate(`/product/${searchResult.id}/`);
  };

  const renderImages = () => {
    let endIndex = currentPage * imagesPerPage;
    if (endIndex > finalResult.length) {
      endIndex = finalResult.length;
    }
    return finalResult.slice(0, endIndex).map((searchResult, index) => (
      <div
        className="col-lg-3 col-md-4 col-sm-4 col-6 p-0 mb-3"
        key={index}
        onClick={() => handleProductClick(searchResult)}
      >
        <div className="camisa m-3">
          <img
            className="img-fluid camisaImg"
            src={searchResult.url}
            alt={`Imagem ${index}`}
            loading="lazy"
          />
          <hr className="linha mt-0 mb-2" />
          <h6>{searchResult.name}</h6>
          <p>
            <b>{searchResult.price}</b>
          </p>
        </div>
      </div>
    ));
  };

  return (
    <div>
      <Header />
      <div className="container searchPage">
        <div className="row m-3 d-flex justify-content-between">
          <div className="col-12 col-md-6 col-lg-6 col-sm-6">
            <h2>
              Resultados para <b>{'"' + search + '"'}</b>
            </h2>
          </div>
          {/* If pageState is 0 then the page is loading */}
          {pageState === 0 ? (
            <div>
              <h4 className="p-5">Buscando, aguarde um momento</h4>
              <div style={{ height: "50vh" }}></div>
            </div>
          ) : pageState === 1 ? (
            <div>
              {" "}
              {/* if pageState is 1 then the product was found, and we render then */}
              <div className="col-12 col-md-6 col-lg-6 col-sm-6 d-flex justify-content-between py-2">
                <p className="mb-0">
                  Exibindo{" "}
                  {currentPage * imagesPerPage > finalResult.length
                    ? finalResult.length
                    : currentPage * imagesPerPage}{" "}
                  - {finalResult.length} produtos
                </p>
              </div>
              <div className="row text-center">{renderImages()}</div>
            </div>
          ) : (
            <div>
              {" "}
              {/* if pageState is 2 then no one product was found */}
              <h4 className="p-5">
                Nenhum produto encontrado, tente buscar por outros produtos
              </h4>
              <div style={{ height: "50vh" }}></div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default SearchResults;
