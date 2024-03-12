import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '../index.css'; 
import Home from './routes/Home';
import Liga from './routes/Liga';
import SearchResults from './routes/SearchResults';
import ErrorPage from './routes/ErrorPage';

function App() {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path='/' element={<Home/>}></Route>
                    <Route path='/collections/:liga' element={<Liga/>}></Route>
                    <Route path='/search' element={<SearchResults />} />
                    <Route path="*" element={<ErrorPage />} /> {/* Rota de fallback para lidar com rotas não encontradas */}
                    <Route path="/pagina-nao-encontrada" element={<ErrorPage />} />
                </Routes>
            </Router>
        </div>
    );
  }

export default App;
