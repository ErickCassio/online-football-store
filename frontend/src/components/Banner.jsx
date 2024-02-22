import React from 'react';
import brand from '../images/MainPage/storeBrand.jpg'

function Banner (props){
    return (
        <div className='banner'>
            <img src={brand} alt="Banner da loja" /> 
            <div className='banner-content'>
                <h3 className='p-2 fw-semibold'>Bem vindo à nossa loja!</h3>
                <h5>Entregamos para todo o país</h5>
            </div>
        </div>
    );
}

export default Banner;