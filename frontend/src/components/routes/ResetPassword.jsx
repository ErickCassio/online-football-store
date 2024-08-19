import { React, useState, useEffect } from "react";
import Header from "../Header";
import Footer from "../Footer";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const [canReset, setCanReset] = useState(false);
  const [loading, setLoading] = useState(true);
  const { token } = useParams(); // Obtém o token da URL
  const [errors, setErrors] = useState("");
  const [sucess, setSucess] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [userData, setUserData] = useState({
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Send a request to verify if the token is valid
        const response = await axios.post(
          `http://localhost:5000/api/verifyToken/${token}`
        );
        //The user can change their password
        setCanReset(true);
        setLoading(false);
      } catch (error) {
        setCanReset(false);
        setLoading(false);
        //The user can't change their password
      }
    };
    verifyToken();
  }, [token]); // Dependência do token para refazer a requisição se mudar

  const validatePassword = (password) => {
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+=])(?!.*\s).{6,}$/;
    return re.test(password);
  };

  const handleFormChanges = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const submitPassword = async () => {
    if (buttonDisabled) {
      return true;
    }
    let hasErrors = false;
    if (!validatePassword(userData.password)) {
      //Verifies if password is strong
      setErrors(
        <div>
          A senha precisa ter no mínimo: <br />
          - 6 caracteres <br />
          - Uma letra maiúscula <br />
          - Uma letra minúscula <br />- Um número e um caractere especial
        </div>
      );
      hasErrors = true;
    } else if (userData.password !== userData.confirmPassword) {
      hasErrors = true;
      setErrors("As duas senhas precisam ser iguais");
    }
    if (!hasErrors) {
      setErrors("");
      try {
        // Send a request to reset the user password
        const response = await axios.post(
          `http://localhost:5000/api/resetPassword/${token}`,
          { password: userData.password }
        );
        setSucess("Senha alterada com sucesso");
        setButtonDisabled(true);
      } catch (err) {
        console.log(err);
        console.log(err.response.data.message);
        setErrors(
          "Não foi possível alterar sua senha, tente novamente mais tarde!"
        );
        setSucess("");
      }
    }
  };
  return (
    <div className="recoverPage d-flex flex-column">
      <div>
        <Header></Header>
      </div>
      {loading ? ( //The page is loading
        <div className="container resgisterPage flex-grow-1 d-flex justify-content-center align-items-center">
          <div className="d-flex align-items-center justify-content-center text-center">
            <div
              className="spinner-border me-2 mb-2 text-secondary"
              role="status"
            ></div>
            <h1>Carregando</h1>
          </div>
        </div>
      ) : canReset ? ( //We can reset user password
        <div className="container resgisterPage flex-grow-1 d-flex justify-content-center align-items-center">
          <div className="col-md-6 mx-auto">
            <h1 className="text-center my-4">Redefinir a senha</h1>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              name="password"
              id="password"
              value={userData.password}
              onChange={handleFormChanges}
            />

            <label htmlFor="confirmPassword">Confirme a senha</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleFormChanges}
            />
            {errors && <span className="text-danger">{errors}</span>}
            {sucess && <span className="text-success">{sucess}</span>}
            <div className="d-flex text-center justify-content-center">
              <button
                disabled={buttonDisabled}
                className="registerButton my-4"
                onClick={submitPassword}
              >
                Redefinir
              </button>
            </div>
          </div>
        </div>
      ) : (
        //We can't reset user password
        <div className="container resgisterPage flex-grow-1 d-flex justify-content-center align-items-center">
          <div className="col-md-6 mx-auto">
            <h1 className="text-center my-4">Acesso negado</h1>
            <div className="text-center">
              <p>O link é inválido ou expirou.</p>
              <p>
                Volte a página de login e solicite a alteração de senha
                novamente!
              </p>
              <div className="d-flex justify-content-center">
                <button
                  className="registerButton my-4 d-flex justify-content-center"
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <Footer></Footer>
      </div>
    </div>
  );
}

export default ResetPassword;
