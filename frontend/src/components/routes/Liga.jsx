import React, {useState, useEffect} from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import axios from 'axios';
import products from '../../products/products.json';

const ligasValidas = ['Brasileirão', 'Bundesliga', 'La Liga', 'Primeira Liga', 'Ligue 1', 'NBA', 'Premier League', 'Seleções', 'Série A']; //Ligas válidas

function Liga() {
  const { liga } = useParams();

  const [productInfo, setProductInfo] = useState({
    url: [],
    name: []
  });

  useEffect(() => {
    getImagens();
    setProductInfo(prevState => ({ ...prevState, name: products[liga] }));
  }, []); // Array de dependências vazio, o que faz com que o efeito seja executado apenas uma vez

  
  if (!ligasValidas.includes(liga)) {
    return <Navigate to="/pagina-nao-encontrada" />; //Se a liga não for encontrada o usuário será mandado para cá
  }
  /*const extractTeamAndProductNames = (imagens) => {
    const auxProdutos = []; // Array auxiliar para produtos
    const teamProductCounts = {}; // Objeto para rastrear a contagem de produtos por time
  
    imagens.forEach(url => {
      const regex = /Camisas\/[^/]+\/([^/]+)\/([^/]+)/;
      const match = url.match(regex);
      let productName = "";
  
      if (match[2] === undefined || match[2].endsWith(".jpg")) {
        productName = match[1];
      } else {
        productName = match[1] + " " + match[2];
      }
  
      const count = teamProductCounts[`${productName}`];
      teamProductCounts[`${productName}`] = count ? count + 1 : 1; // Incrementa a contagem para o produto atual
  
      if (count) {
        // Se o produto já foi visto antes, adiciona o número da repetição ao nome
        productName += ` ${count + 1}`;
      }
  
      auxProdutos.push(productName);
    });
  
    console.log(auxProdutos);
  };*/ //Foi usado para pegar o nome dos produtos

  const getImagens = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/images/${liga}`);
      if(liga === "Brasileirão"){
        //Isso é feito pois o primeiro item do array Brasileirão é vazio
        const imagensSemPrimeiroItem = response.data.slice(1);
        setProductInfo(prevState => ({ ...prevState, url: imagensSemPrimeiroItem }));
      }
      else{
        setProductInfo(prevState => ({ ...prevState, url: response.data }));
      }
    } catch (error) {
      console.error('Erro ao obter imagens:', error);
    }
  };

  return (
    <div>
        <Header/>
          <div className='container'>
            {productInfo.url.map((url, index) => (
              <div className='camisa m-3' key={index}>
                <img className='img-fluid camisaImg' src={url}></img>
                <hr className="linha mt-0 mb-2"></hr>
                <p>Desde <b>€25</b></p>
              </div>
            ))}
          </div>
        <Footer/>
    </div>
  );
}

export default Liga;
