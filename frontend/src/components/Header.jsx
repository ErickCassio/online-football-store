import React from 'react';
import storeLogo from '../images/MainPage/storeLogo2.png';
import Dropdown from './Dropdown';

//import SearchIcon from '@mui/icons-material/Search';
//import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function Header(){
    return (
      <div>
      <nav className="navbar navbar-expand-lg navHeader fixed-top">
        <div className="container-fluid">
          <div className="navbar-brand d-flex align-items-center m-0">
            <img src={storeLogo} alt="Logo" className="imgLogo me-2" />
            <a className="storeLogo mb-0" href="/">ZZFUTEBOLSTORE</a>
          </div>
          <ul className="navbar-nav ms-auto flex-row">
            <li className="nav-item">
              <button className="icon-button navButton">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </li>
            <li className="nav-item">
              <button className="icon-button navButton">
                <i className="fa-solid fa-cart-shopping"></i>
              </button>
            </li>
            <li className="nav-item">
              <button className="icon-button navButton">
                <i className="fa-solid fa-user"></i>
              </button>
            </li>
            <Dropdown/>
          </ul>
        </div>
      </nav>
      <div className='divisao'><hr /></div>
    </div>
    );
}

export default Header;