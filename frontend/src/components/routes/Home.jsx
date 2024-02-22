import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../Header';
import Destaques from '../Destaques';
import Footer from '../Footer';
import Ligas from '../Ligas';
import Banner from '../Banner';

import ligaPortuguesa from '../../images/MainPage/ligaPortugal.png';
import premierLeague from '../../images/MainPage/premierLeague.png';
import laLiga from '../../images/MainPage/laLiga.png';
import serieA from '../../images/MainPage/serieA.png';

function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/data') // Rota modificada no backend
      .then(response => {
        setData(response.data.number); // Armazena o número recebido na state 'data'
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
      });
  }, []);



  function importAll(r) {
    let images = {};
    if (r.keys().length > 0) {
      r.keys().forEach((item, index) => {
        images[item.replace('./', '')] = r(item);
      });
    }
    return images;
  }

  const bannerSRC = require.context('../../images/MainPage/Banner', false, /\.(jpe?g)$/);
  const banner = importAll(bannerSRC);
  const keys = Object.keys(banner);

  const portugalSRC = require.context('../../images/MainPage/Primeira Liga', false, /\.(jpe?g)$/);
  const portugal = importAll(portugalSRC);

  const premierLeagueSRC = require.context('../../images/MainPage/Premier League', false, /\.(jpe?g)$/);
  const premier = importAll(premierLeagueSRC);

  const laLigaSRC = require.context('../../images/MainPage/La Liga', false, /\.(jpe?g)$/);
  const laLigaEs = importAll(laLigaSRC); 

  const serieASRC = require.context('../../images/MainPage/Serie A', false, /\.(jpe?g)$/);
  const serieAIt = importAll(serieASRC); 

  return (
    <div className="App">
      <Header/>
      <Banner/>
      <div className='AppBody'>
      
        <div className="container text-start">

          <h3 className='my-3 fw-bold'>Comprar por liga</h3>
          <div className="row">
            {/* Mapear os primeiros cinco elementos */}
            {keys.slice(0, 4).map((imagem, index) => (
              <Ligas key={index} imgURL={banner[imagem]} name={imagem} />
            ))}

            {/* Mapear os últimos três elementos */}
            {keys.slice(5).map((imagem, index) => (
              <Ligas key={index + 6} imgURL={banner[imagem]} name={imagem} />
            ))}

            {/* Renderizar o sexto elemento por último */}
            <Ligas key={4} imgURL={banner[keys[4]]} name={keys[4]} />
          </div>
        </div>

        <div className='destaques'>
          <Destaques bannerURL={ligaPortuguesa} tShirt={portugal} nomeLiga="Primeira Liga"/>
          <Destaques bannerURL={premierLeague} tShirt={premier} nomeLiga="Premier League"/>
          <Destaques bannerURL={laLiga} tShirt={laLigaEs} nomeLiga="La Liga"/>
          <Destaques bannerURL={serieA} tShirt={serieAIt} nomeLiga="Série A Itália"/>
        </div>

        <h1>Number from Server:</h1>
        {data !== null ? <p>{data}</p> : <p>Loading...</p>}
      </div>
      <Footer/>
    </div>
  );
}

export default Home;
