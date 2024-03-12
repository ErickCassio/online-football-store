import React, {useState, useEffect} from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import products from '../../products/products.json';
import axios from 'axios';

const imagesPerPage = 20;

function SearchResults() {
  const [currentPage, setCurrentPage] = useState(1);
  const [finalResult, setFinalResult] = useState({
    url: [],
    name: []
  });
  const [searchParams] = useSearchParams();
  const search = decodeURIComponent(searchParams.get('input'));
  
  
  useEffect(() => {
    const fetchImagesAndFilterProducts = async () => {
      try {
        const productUrlMap = {}; // Objeto para armazenar as URLs de imagem por chave de produto
    
        // Obter URLs de imagem para cada chave de produto
        await Promise.all(Object.keys(products).map(async (key) => {
          try {
            const response = await axios.get(`http://localhost:5000/api/images/${key}`);
            const images = key === 'Brasileirão' ? response.data.slice(1) : response.data;
            productUrlMap[key] = images; // Armazenar URLs de imagem para esta chave de produto
          } catch (error) {
            console.error(`Erro ao obter imagens para a chave ${key}:`, error);
            productUrlMap[key] = []; // Definir array vazio em caso de erro
          }
        }));
    
        const productNameAux = [];
        const productUrl = [];
    
        Object.keys(products).forEach((key) => {
          const keywords = search.split(' ');
          const results = products[key].filter((product) =>
            keywords.every((keyword) => product.toLowerCase().includes(keyword))
          );
    
          if (results.length > 0) {
            productNameAux.push(results);
            results.forEach((result) => {
              const index = products[key].indexOf(result);
              productUrl.push(productUrlMap[key][index]); // Obter URL correspondente usando a chave de produto
            });
          }
        });
        const productNameFlat = productNameAux.flat();
        // Quando todos os produtos foram verificados e todas as imagens foram buscadas
        setFinalResult({ name: productNameFlat, url: productUrl });
      } catch (error) {
        console.error('Erro ao buscar imagens e filtrar produtos:', error);
      }
    };    
  
    fetchImagesAndFilterProducts();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [search]);

  const handleScroll = () => {
    if (
      (window.innerHeight + document.documentElement.scrollTop + 20) >= document.documentElement.offsetHeight
    ) {
      return (loadMoreImages())
    };
  }

  const loadMoreImages = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const renderImages = () => {
    let endIndex = currentPage * imagesPerPage;
    if(endIndex > finalResult.url.length) {endIndex = finalResult.url.length}
    return finalResult.url.slice(0, endIndex).map((url, index) => (
      <div className='col-lg-3 col-md-4 col-sm-4 col-6 p-0 mb-3' key={index}>
        <div className='camisa m-3'>
          <img className='img-fluid camisaImg' src={url} alt={`Imagem ${index}`} loading="lazy" />
          <hr className="linha mt-0 mb-2" />
          <h6>{finalResult.name[index]}</h6>
          <p>Desde <b>€25</b></p>
        </div>
      </div>
    ));
  }

  return (
    <div>
      <Header/>
      <div className='container searchPage'>
      <div className='row m-3 d-flex justify-content-between'>
        <div className='col-12 col-md-6 col-lg-6 col-sm-6'>
          <h2>Resultados para <b>{"\"" + search + "\""}</b></h2>
        </div>
        {finalResult.url.length > 0 ? 
        <div className='col-12 col-md-6 col-lg-6 col-sm-6 d-flex justify-content-between py-2'>
          <p className='mb-0'>Exibindo {((currentPage * imagesPerPage > finalResult.url.length) ? finalResult.url.length : currentPage * imagesPerPage)} - {finalResult.url.length} produtos</p>
        </div> : null}
      </div>
      <div className='row text-center'>
        {finalResult.url.length > 0 ?
        (renderImages()): 
        (<div>
            <h4 className='p-5'>Nenhum produto encontrado, tente buscar por outros produtos</h4>
            <div style={{height:"50vh"}}></div>
        </div>)}
      </div>
        
      </div>
      <Footer/>
    </div>
  );
}

export default SearchResults;