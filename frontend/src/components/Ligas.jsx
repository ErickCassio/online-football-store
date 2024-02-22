import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Ligas (props){
    const [caminho, setCaminho] = useState("M3 12h15M12 5l7 7-7 7");

    const mudarCaminho = () => {
      setCaminho("M3 12h18M15 5l7 7-7 7");
    }
  
    const resetarCaminho = () => {
      setCaminho("M3 12h15M12 5l7 7-7 7");
    }

    const nomeDaCamisa = props.name.replace(/\.(jpg|jpeg)/i, '');

    return (
    <div className='col-lg-3 col-md-4 col-sm-4 col-6 p-2 ligas' onMouseOver={mudarCaminho} onMouseOut={resetarCaminho}>
      {/*O div acima possui todas as classes definidas, usando Bootstrap, para manter a responsividade*/}
      <Link to={`/collections/${nomeDaCamisa}`} className='linkSemEstilo'>
          <div className='ligasImg'><img className='img-fluid' src={props.imgURL} alt={nomeDaCamisa}></img></div>
          <h6 className='mt-2 fw-medium'>{nomeDaCamisa}
          {/*O svg abaixo é uma seta fina*/}
              <span className='ms-1'>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={caminho} />
              </svg>
              </span>
          </h6>
      </Link>
    </div>);
}

export default Ligas;