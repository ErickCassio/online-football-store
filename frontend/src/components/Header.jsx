import React, { useState, useLayoutEffect, useEffect } from "react";
import storeLogo from "../images/MainPage/storeLogo2.png";
import OffCanvas from "./OffCanvas";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../utils/api";

//import SearchIcon from '@mui/icons-material/Search';
//import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function Header() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [searchBarMobile, setSearchBarMobile] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [userNickname, setUserNickname] = useState("");
  const [showUserInfo, setShowUserInfo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserInfo() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          // Verifies if the token is expired
          if (decoded.exp * 1000 < Date.now()) {
            //Remove the token
            localStorage.removeItem("token");
          } else {
            //Valid token, catchs user information
            try {
              const response = await api.get(`/userData/${token}`);
              setUserNickname(response.data.nickname);
            } catch (error) {
              localStorage.removeItem("token");
            }
          }
        } catch (error) {
          localStorage.removeItem("token");
        }
      }
    }

    fetchUserInfo();
  }, []);

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 600px)");

    // Update state based on initial media query match
    setIsSmallScreen(mediaQuery.matches);

    // Add event listener using the modern `addEventListener` approach
    const handleResize = (e) => setIsSmallScreen(e.matches);
    mediaQuery.addEventListener("change", handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  const showSeachBar = () => {
    setSearchBarMobile((prevState) => !prevState);
  };

  const handleChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Codifies the search text
    const encodedSearchInput = encodeURIComponent(searchInput);
    // Navigate o search route
    return navigate(`/search?input=${encodedSearchInput}`);
  };

  const navigateToCart = () => {
    return navigate(`/cart`);
  };

  const openUserInfo = () => {
    const token = localStorage.getItem("token");
    if (token && userNickname.length > 0) {
      //Verifies if the token exists and if users receive their nickname
      setShowUserInfo(!showUserInfo);
    } else {
      //If not then send him to login page
      navigate("/login");
    }
    return;
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navHeader fixed-top">
        <div className="container-fluid">
          <div className="navbar-brand d-flex align-items-center m-0">
            <img src={storeLogo} alt="Logo" className="imgLogo me-2" />
            {searchBarMobile ? null : (
              <Link to="/" className="linkSemEstilo storeLogo mb-0">
                ZZFUTEBOLSTORE
              </Link>
            )}
          </div>
          <ul className="navbar-nav ms-auto flex-row my-1">
            <li className="nav-item">
              {/* When the device is small, the search bar only appears when the searchButton is clicked */}
              {isSmallScreen ? (
                <div className="d-flex align-items-center">
                  {/* When the user clicks the search button a search bar will appear  */}
                  {searchBarMobile ? (
                    <div className="searchBarMobile">
                      <form onSubmit={handleFormSubmit}>
                        <input
                          type="text"
                          placeholder="O que procuras?"
                          className="searchInput px-2 mx-2"
                          value={searchInput}
                          onChange={handleChange}
                          style={{ width: "41vw", padding: "0.18em" }}
                        />
                      </form>
                    </div>
                  ) : null}
                  <button
                    className="icon-button navButton ps-1"
                    onClick={showSeachBar}
                  >
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </div>
              ) : (
                <div className="d-flex align-items-center">
                  <form onSubmit={handleFormSubmit}>
                    <input
                      type="text"
                      placeholder="O que estás a procura?"
                      className="searchInput px-2 py-1 mx-2"
                      value={searchInput}
                      onChange={handleChange}
                      style={{ width: "30vw" }}
                    />
                  </form>
                  <button className="icon-button navButton ps-1">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </div>
              )}
            </li>
            <li className="nav-item">
              <button
                className="icon-button navButton"
                onClick={navigateToCart}
              >
                <i className="fa-solid fa-cart-shopping"></i>
              </button>
            </li>
            <li className="nav-item">
              <button className="icon-button navButton" onClick={openUserInfo}>
                <i className="fa-solid fa-user"></i>
              </button>
            </li>
            <OffCanvas />
          </ul>
        </div>
      </nav>
      <div className="divisao">
        <hr />
      </div>
      {showUserInfo ? (
        <div className="dropdown-header-user">
          <h6 className="mx-2 my-2">Olá, {userNickname}</h6>
          <div className="mx-2">
            <button
              className="dropdown-item "
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
            >
              <i className="fa-solid fa-right-from-bracket me-1"></i>
              Sair
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Header;
