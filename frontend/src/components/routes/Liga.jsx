// Liga.jsx
import React, { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import Filter from "../Filter";
import api from "../../utils/api";

const ligasValidas = [
  "Brasileirão",
  "Bundesliga",
  "La Liga",
  "Primeira Liga",
  "Ligue 1",
  "NBA",
  "Premier League",
  "Seleções",
  "Serie A",
  "Nova Temporada",
]; // Ligas válidas
const imagesPerPage = 20;

function Liga() {
  const { liga } = useParams();

  //Create an array that will contains the products information, it is an object
  const [products, setProducts] = useState([]);
  //Set the loading status
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterApplyed, setFilterApplyed] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState({
    url: [],
    name: [],
  });
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getImagens();
    window.addEventListener("scroll", handleScrollThrottled);
    return () => window.removeEventListener("scroll", handleScrollThrottled);
  }, [liga]);

  if (!ligasValidas.includes(liga)) {
    return <Navigate to="/page-not-found" />; //Se a liga não for encontrada o usuário será mandado para cá
  }

  function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  const handleScroll = () => {
    const offset = 300; // Pixels antes de atingir o final da página para carregar mais
    if (
      window.innerHeight + document.body.scrollTop + offset >=
      document.documentElement.offsetHeight
    ) {
      loadMoreImages();
    }
  };

  const handleScrollThrottled = throttle(handleScroll, 200);

  const getImagens = async () => {
    try {
      const response = await api.get(`/images/${liga}`);
      const sortedProducts = response.data.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
      setProducts(sortedProducts);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao obter imagens:", error);
      setLoading(false);
    }
  };

  const loadMoreImages = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handleProductClick = (id) => {
    return navigate(`/product/${id}`);
  };

  const renderImages = () => {
    let endIndex = currentPage * imagesPerPage;
    if (endIndex > products.length) {
      endIndex = products.length;
    }
    //Render images little by little
    return products.slice(0, endIndex).map((product, index) => (
      <div className="col-lg-3 col-md-4 col-sm-4 col-6 p-0 mb-3" key={index}>
        <div
          className="camisa m-3"
          onClick={() => {
            handleProductClick(product.id);
          }}
        >
          <img
            className="img-fluid camisaImg"
            src={product.url}
            alt={`Imagem ${index}`}
            loading="lazy"
          />
          <hr className="linha mt-0 mb-2" />
          <h6>{product.name}</h6>
          <p>
            <b>{product.price}</b>
          </p>
        </div>
      </div>
    ));
  };

  const renderFilteredImages = () => {
    let endIndex = currentPage * imagesPerPage;
    if (endIndex > filteredProducts.length) {
      endIndex = filteredProducts.length;
    }
    return filteredProducts.slice(0, endIndex).map((item, index) => (
      <div className="col-lg-3 col-md-4 col-sm-4 col-6 p-0 mb-3" key={index}>
        <div
          className="camisa m-3"
          onClick={() => {
            handleProductClick(item.id);
          }}
        >
          <img
            className="img-fluid camisaImg"
            src={item.url}
            alt={`Imagem ${index}`}
            loading="lazy"
          />
          <hr className="linha mt-0 mb-2" />
          <h6>{item.name}</h6>
          <p>
            <b>{item.price}</b>
          </p>
        </div>
      </div>
    ));
  };

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  const handleFilterState = (bool) => {
    setFilterApplyed(bool);
  };

  const handleFilterChange = (filteredProducts) => {
    setFilteredProducts(filteredProducts);
  };

  return (
    <div>
      <Header />
      <div className="container ligaPage">
        <div className="row m-3 d-flex justify-content-between">
          <div className="col-12 col-md-6 col-lg-6 col-sm-6">
            <h2>{liga}</h2>
          </div>
          <div className="col-12 col-md-6 col-lg-6 col-sm-6 d-flex justify-content-between py-2">
            <p className="mb-0">
              Exibindo{" "}
              {filterApplyed
                ? currentPage * imagesPerPage > filteredProducts.length
                  ? filteredProducts.length
                  : currentPage * imagesPerPage
                : currentPage * imagesPerPage > products.length
                ? products.length
                : currentPage * imagesPerPage}{" "}
              - {filterApplyed ? filteredProducts.length : products.length}{" "}
              produtos
            </p>
            <button className="filterButton" onClick={toggleMenu}>
              <svg
                fill="#000000"
                width="20px"
                height="20px"
                viewBox="0 0 32 32"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Filtro</title>
                <path d="M30 6.749h-28c-0.69 0-1.25 0.56-1.25 1.25s0.56 1.25 1.25 1.25v0h28c0.69 0 1.25-0.56 1.25-1.25s-0.56-1.25-1.25-1.25v0zM24 14.75h-16c-0.69 0-1.25 0.56-1.25 1.25s0.56 1.25 1.25 1.25v0h16c0.69 0 1.25-0.56 1.25-1.25s-0.56-1.25-1.25-1.25v0zM19 22.75h-6.053c-0.69 0-1.25 0.56-1.25 1.25s0.56 1.25 1.25 1.25v0h6.053c0.69 0 1.25-0.56 1.25-1.25s-0.56-1.25-1.25-1.25v0z"></path>
              </svg>
            </button>
          </div>
        </div>

        {
          /* When the page is loading */ loading ? (
            <div className="mt-5 ms-4">
              <h3>Carregando...</h3>
              <div style={{ height: "50vh" }}></div>
            </div>
          ) : null
        }

        {menuOpen && (
          <Filter
            menuState={toggleMenu}
            liga={liga}
            originalProducts={products}
            selectedTypes={selectedTypes}
            selectedTeams={selectedTeams}
            onFilterChange={handleFilterChange}
            onFilterStateChange={handleFilterState}
            setSelectedTypes={setSelectedTypes}
            setSelectedTeams={setSelectedTeams}
          />
        )}
        <div className="row text-center">
          {filterApplyed ? (
            filteredProducts.length > 0 ? (
              renderFilteredImages()
            ) : (
              <div>
                <h4 className="p-5">
                  Nenhum produto encontrado, experimente limpar os filtros ou
                  use a barra de pesquisa
                </h4>
                <div style={{ height: "50vh" }}></div>
              </div>
            )
          ) : (
            renderImages()
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Liga;
