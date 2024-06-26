// Liga.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import Filter from '../Filter';
import axios from 'axios';
import products from '../../products/products.json';

const ligasValidas = ['Brasileirão', 'Bundesliga', 'La Liga', 'Primeira Liga', 'Ligue 1', 'NBA', 'Premier League', 'Seleções', 'Serie A']; // Ligas válidas
const imagesPerPage = 20;

function Liga() {
  const { liga } = useParams();

  const [productInfo, setProductInfo] = useState({
    url: [],
    name: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterApplyed, setFilterApplyed] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState({
    url: [],
    name: []
  });
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getImagens();
    setProductInfo(prevState => ({ ...prevState, name: products[liga] }));
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [liga]); // Atualize sempre que a liga mudar

  if (!ligasValidas.includes(liga)) {
    return <Navigate to="/page-not-found" />; //Se a liga não for encontrada o usuário será mandado para cá
  }

  const handleScroll = () => {
    if (
      (window.innerHeight + document.documentElement.scrollTop + 20) >= document.documentElement.offsetHeight
    ) {
      return (loadMoreImages())
    };
  }

  const getImagens = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/images/${liga}`);
      const images = liga === 'Brasileirão' ? response.data.slice(1) : response.data;
      setProductInfo(prevState => ({ ...prevState, url: [...prevState.url, ...images] }));
    } catch (error) {
      console.error('Erro ao obter imagens:', error);
    }
  };

  const loadMoreImages = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const handleProductClick = (url, name) => {
    const encodedProductURL = encodeURIComponent(url);
    return navigate(`/product/${name}/?input=${encodedProductURL}`);
  }

  const renderImages = () => {
    let endIndex = currentPage * imagesPerPage;
    if(endIndex > productInfo.url.length) {endIndex = productInfo.url.length}
    return productInfo.url.slice(0, endIndex).map((url, index) => (
      <div className='col-lg-3 col-md-4 col-sm-4 col-6 p-0 mb-3' key={index}>
        <div className='camisa m-3' onClick={() => {handleProductClick(url, productInfo.name[index])}}>
          <img className='img-fluid camisaImg' src={url} alt={`Imagem ${index}`} loading="lazy" />
          <hr className="linha mt-0 mb-2" />
          <h6>{productInfo.name[index]}</h6>
          <p>Desde <b>€25</b></p>
        </div>
      </div>
    ));
  };

  const renderFilteredImages = () => {
    let endIndex = currentPage * imagesPerPage;
    if(endIndex > filteredProducts.length) {endIndex = filteredProducts.length}
    return filteredProducts.slice(0, endIndex).map((item, index) => (
      <div className='col-lg-3 col-md-4 col-sm-4 col-6 p-0 mb-3' key={index}>
        <div className='camisa m-3' onClick={() => {handleProductClick(item.url, item.name)}}>
          <img className='img-fluid camisaImg' src={item.url} alt={`Imagem ${index}`} loading="lazy" />
          <hr className="linha mt-0 mb-2" />
          <h6>{item.name}</h6>
          <p>Desde <b>€25</b></p>
        </div>
      </div>
    ));
  };

  const toggleMenu = () => {
    setMenuOpen(prevState => !prevState);
  };

  const handleFilterState = (bool) => {
    setFilterApplyed(bool);
  }

  const handleFilterChange = (filteredProducts) => {
    setFilteredProducts(filteredProducts);
  };

  return (
    <div>
      <Header />
      <div className='container ligaPage'>
        <div className='row m-3 d-flex justify-content-between'>
          <div className='col-12 col-md-6 col-lg-6 col-sm-6'>
            <h2>{liga}</h2>
          </div>
          <div className='col-12 col-md-6 col-lg-6 col-sm-6 d-flex justify-content-between py-2'>
          <p className='mb-0'>
            Exibindo {
              filterApplyed ? 
              ((currentPage * imagesPerPage > filteredProducts.length) ? filteredProducts.length : currentPage * imagesPerPage) :
              ((currentPage * imagesPerPage > productInfo.url.length) ? productInfo.url.length : currentPage * imagesPerPage)
            } - {
              filterApplyed ? 
              filteredProducts.length :
              productInfo.url.length
            } produtos
          </p>
              <button className='filterButton' onClick={toggleMenu}>
                <svg fill="#000000" width="20px" height="20px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <title>Filtro</title>
                <path d="M30 6.749h-28c-0.69 0-1.25 0.56-1.25 1.25s0.56 1.25 1.25 1.25v0h28c0.69 0 1.25-0.56 1.25-1.25s-0.56-1.25-1.25-1.25v0zM24 14.75h-16c-0.69 0-1.25 0.56-1.25 1.25s0.56 1.25 1.25 1.25v0h16c0.69 0 1.25-0.56 1.25-1.25s-0.56-1.25-1.25-1.25v0zM19 22.75h-6.053c-0.69 0-1.25 0.56-1.25 1.25s0.56 1.25 1.25 1.25v0h6.053c0.69 0 1.25-0.56 1.25-1.25s-0.56-1.25-1.25-1.25v0z"></path>
                </svg>
              </button>
          </div>
        </div>
        {menuOpen && <Filter menuState={toggleMenu} liga={liga} originalProducts={productInfo} selectedTypes={selectedTypes} selectedTeams={selectedTeams} 
        onFilterChange={handleFilterChange} onFilterStateChange={handleFilterState} setSelectedTypes={setSelectedTypes} setSelectedTeams={setSelectedTeams}/>}
        <div className='row text-center'>
          {filterApplyed ?
          (filteredProducts.length > 0 ? renderFilteredImages() : 
          <div>
            <h4 className='p-5'>Nenhum produto encontrado, experimente limpar os filtros ou use a barra de pesquisa</h4>
            <div style={{height:"50vh"}}></div>
          </div>) : renderImages()}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Liga;