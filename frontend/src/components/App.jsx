import React, { useEffect } from "react";
import {
  useNavigate,
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../index.css";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Recover from "./routes/Recover";
import ResetPassword from "./routes/ResetPassword";
import Liga from "./routes/Liga";
import SearchResults from "./routes/SearchResults";
import Product from "./routes/Product";
import ErrorPage from "./routes/ErrorPage";
import Cart from "./routes/Cart";
import Validate from "./routes/Validate";

function AuthenticatedRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Verifica se o token está expirado
        if (decoded.exp * 1000 < Date.now()) {
          //Remove o token e mantém o usuário na rota que está
          localStorage.removeItem("token");
        } else {
          navigate("/");
        }
      } catch (error) {
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  return children;
}

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route
            path="/login"
            element={
              <AuthenticatedRoute>
                <Login />
              </AuthenticatedRoute>
            }
          ></Route>
          <Route
            path="/register"
            element={
              <AuthenticatedRoute>
                <Register />
              </AuthenticatedRoute>
            }
          ></Route>
          <Route
            path="/recover"
            element={
              <AuthenticatedRoute>
                <Recover />
              </AuthenticatedRoute>
            }
          ></Route>
          <Route path="/confirmacao/:token" element={<Validate />}></Route>
          <Route
            path="/resetPassword/:token"
            element={<ResetPassword />}
          ></Route>
          <Route path="/collections/:liga" element={<Liga />}></Route>
          <Route path="/search" element={<SearchResults />} />
          <Route path="*" element={<ErrorPage />} />{" "}
          {/* Fallback route to handle with not found routes */}
          <Route path="/page-not-found" element={<ErrorPage />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />;
        </Routes>
      </Router>
    </div>
  );
}

export default App;
