import React from 'react';
import Camisas from './Camisas.jsx';

function Destaques(props) {
  return (
      <div className="container text-center">
        <div className="row">
          <div className="col">
            <img className="img-fluid mb-3" src={props.bannerURL} alt="ligas" />
          </div>
        </div>
          <div className="row">
              {Object.keys(props.tShirt).map((imagem, index) => (
                <div className='col-lg-3 col-md-4 col-sm-4 col-6 p-0' key={index}>
                  <Camisas key={index} imgSrc={props.tShirt[imagem]} altText={imagem} />
                </div>
              ))}
          </div>
          <button type="button" className="btn btn-primary btn-sm m-3" style={{background:"#152C40"}}>Ver mais</button>
        </div>
  );
}

export default Destaques;
