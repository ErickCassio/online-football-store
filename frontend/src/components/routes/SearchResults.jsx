import React, {useState, useEffect} from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import products from '../../products/products.json';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const imagesPerPage = 20;

function SearchResults() {
  const [currentPage, setCurrentPage] = useState(1);
  const [finalResult, setFinalResult] = useState({
    url: [],
    name: []
  });
  //Defines the search state, 0 if is searching, 1 if finds something, 2 if nothing was found
  const [pageState, setPageState] = useState(0);

  const [searchParams] = useSearchParams();
  const search = decodeURIComponent(searchParams.get('input'));
  
  const navigate = useNavigate();
  
  useEffect(() => {
    setPageState(0);
    const fetchImagesAndFilterProducts = async () => {
      try {
        const productUrlMap = {};
    
        // Get Image Url for each product key
        await Promise.all(Object.keys(products).map(async (key) => {
          try {
            const response = await axios.get(`http://localhost:5000/api/images/${key}`);
            const images = key === 'Brasileirão' ? response.data.slice(1) : response.data;
            productUrlMap[key] = images; // Store Image Urls to this products key
          } catch (error) {
            console.error(`Erro ao obter imagens para a chave ${key}:`, error);
            productUrlMap[key] = []; // Defines a empty array in error cases
          }
        }));
        console.log("entrei aqui");
        const productNameAux = [];
        const productUrl = [];
    
        Object.keys(products).forEach((key) => {
          const keywords = search.split(' ');
          const results = products[key].filter((product) =>
            keywords.every((keyword) => product.toLowerCase().includes(keyword))
          );
    
          if (results.length > 0) {
            //If results isn't empty, then we get the product name and the corresponding product url
            productNameAux.push(results);
            results.forEach((result) => {
              const index = products[key].indexOf(result);
              productUrl.push(productUrlMap[key][index]);
            });
          }
        });
        const productNameFlat = productNameAux.flat();
        // When all the products where found and the corresponding url for each product
        setFinalResult({ name: productNameFlat, url: productUrl });
        setPageState(productNameFlat.length > 0 ? 1 : 2);
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

  const handleProductClick = (index) => {
    const encodedProductURL = encodeURIComponent(finalResult.url[index]);
    // Navigate o search route
    return navigate(`/product/${finalResult.name[index]}/?input=${encodedProductURL}`);
  }

  const renderImages = () => {
    let endIndex = currentPage * imagesPerPage;
    if(endIndex > finalResult.url.length) {endIndex = finalResult.url.length}
    return finalResult.url.slice(0, endIndex).map((url, index) => (
      <div className='col-lg-3 col-md-4 col-sm-4 col-6 p-0 mb-3' key={index} onClick={() => handleProductClick(index)}>
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
          {/* If pageState is 0 then the page is loading */}
          {(pageState === 0) ? 
          (<div>
              <h4 className='p-5'>Buscando, aguarde um momento</h4>
              <div style={{height:"50vh"}}></div>
          </div>) : 
          (pageState === 1 ?
            (<div> {/* if pageState is 1 then the product was found, and we render then */}
              <div className='col-12 col-md-6 col-lg-6 col-sm-6 d-flex justify-content-between py-2'> 
                <p className='mb-0'>Exibindo {((currentPage * imagesPerPage > finalResult.url.length) ? finalResult.url.length : currentPage * imagesPerPage)} - {finalResult.url.length} produtos</p>
              </div>
              <div className='row text-center'>
                {renderImages()}
              </div>
            </div>) : 
            <div> {/* if pageState is 2 then no one product was found */}
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