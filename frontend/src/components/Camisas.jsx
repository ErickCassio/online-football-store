import React from 'react';

function Camisas (props){
    const nomeDaCamisa = props.altText.replace(/\.(jpg|jpeg)/i, '');

    return (
    <div className='camisa m-3'>
        <img className='img-fluid camisaImg' src={props.imgSrc} alt={props.altText}></img>
        <hr className="linha mt-0 mb-2"></hr>
        <h6>{nomeDaCamisa}</h6>
        <p>Desde <b>€25</b></p>
    </div>);
}

export default Camisas;