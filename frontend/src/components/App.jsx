import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '../index.css'; 
import Home from './routes/Home';
import Liga from './routes/Liga';
import SearchResults from './routes/SearchResults';
import Product from './routes/Product';
import ErrorPage from './routes/ErrorPage';
import Cart from './routes/Cart';


function App() {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<Home/>}></Route>
                    <Route path="/collections/:liga" element={<Liga/>}></Route>
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="*" element={<ErrorPage />} /> {/* Rota de fallback para lidar com rotas não encontradas */}
                    <Route path="/page-not-found" element={<ErrorPage />} />
                    <Route path="product/:productName" element={<Product/>}/>
                    <Route path="/cart" element={<Cart/>}/>;
                </Routes>
            </Router>
        </div>
    );
  }

export default App;
