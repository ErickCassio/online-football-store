import { React, useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const [emailSended, setEmailSended] = useState("");

  const navigate = useNavigate();

  const handleFormChanges = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const submitForm = async () => {
    let hasErrors = false;
    let newErrors = "";
    if (userData.email.length === 0) {
      newErrors = "O campo email não pode estar vazio";
      hasErrors = true;
    } else if (userData.password.length === 0) {
      newErrors = "O campo senha não pode estar vazio";
      hasErrors = true;
    }
    setErrors(newErrors);
    if (!hasErrors) {
      setLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:5000/api/login",
          userData
        );
        // Store the token on the user desktop
        localStorage.setItem("token", response.data.token);
        setLoading(false);
        navigate("/");
      } catch (err) {
        if (err.response) {
          const errorMsg = err.response.data.error;
          if (
            errorMsg.includes("Usuário não encontrado") ||
            errorMsg.includes("Senha incorreta")
          ) {
            setErrors("Usuário ou senha inválidos");
          } else if (errorMsg.includes("Usuário não verificado")) {
            setEmailVerified(false);
          } else {
            setErrors(errorMsg);
          }
        } else {
          setErrors("Erro ao fazer login. Tente novamente mais tarde.");
        }
        setLoading(false);
      }
    } else {
      console.log("Formulário inválido, exibindo erros...");
    }
  };

  const handleEmailSend = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/reAuthUser",
        { email: userData.email }
      );
      setEmailSended("Email enviado! Verifique sua caixa de entrada!");
    } catch (err) {
      if (err.response) {
        setEmailSended(err.response.data.error);
      }
    }
  };

  return (
    <div>
      <Header></Header>
      <div className="container resgisterPage">
        {emailVerified ? (
          <div className="col-md-8 col-lg-6 mx-auto">
            <h1 className="text-center my-4">Fazer Login</h1>
            <div className="mx-5">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={userData.email}
                onChange={handleFormChanges}
                className="form-input"
              />

              <label htmlFor="password">Senha</label>
              <div className="password-container d-flex align-items-center mb-2">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={userData.password}
                  onChange={handleFormChanges}
                />
                <span
                  className="input-group-text px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                >
                  <i className="fa-solid fa-eye"></i>
                </span>
              </div>
              <p className="p-0 m-0">
                <Link to="/recover">Esqueceu sua senha?</Link>
              </p>
              {errors && <span className="text-danger">{errors}</span>}
              {loading ? (
                <div className="d-flex justify-content-center  ">
                  <button className="registerButton my-4 d-flex align-items-center">
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    ></span>
                    <span role="status">Aguarde...</span>
                  </button>
                </div>
              ) : (
                <div className="d-flex justify-content-center">
                  <button
                    className="registerButton my-4 d-flex justify-content-center"
                    onClick={submitForm}
                  >
                    Login
                  </button>
                </div>
              )}
              <p>
                Não tem uma conta? <Link to="/register">Registre-se</Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="col-md-8 col-lg-6 mx-auto">
            <h1 className="text-center my-4">Email não verificado</h1>
            <div className="mx-5 mb-5 px-3 py-2 verify-email">
              <p>Sua conta ainda não foi verificada, verifique seu email</p>
              <p>
                Se não encontrar nosso email na caixa de entrada verifique o
                <b> spam</b>
              </p>
              <p>
                Caso não tenha recebido nosso email, use esse link para receber
                um novo
              </p>
              <div className="d-flex justify-content-center mb-2">
                <button
                  className="btn btn-primary mx-auto"
                  onClick={handleEmailSend}
                >
                  Autenticar email
                </button>
              </div>
              <p className="p-0 m-0 d-flex justify-content-center">
                {emailSended}
              </p>
            </div>
            <div className="mb-2"></div>
          </div>
        )}
      </div>
      <Footer></Footer>
    </div>
  );
}

export default Login;
