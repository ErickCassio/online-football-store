import { React, useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import { Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const [userMail, setUserMail] = useState("");
  const [errors, setErrors] = useState("");
  const [sucess, setSucess] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const handleFormChanges = (e) => {
    const { name, value } = e.target;
    setUserMail(value);
  };

  const submitForm = async () => {
    if (buttonDisabled) {
      return true;
    }
    let hasErrors = false;
    if (userMail.length === 0) {
      setErrors("Digite o email");
      hasErrors = true;
    }
    if (!hasErrors) {
      setErrors("");
      try {
        const response = await axios.post(
          "http://localhost:5000/api/requestPasswordReset",
          { email: userMail }
        );
        setSucess("E-mail enviado! Verifique sua caixa de entrada ou spam");
        setButtonDisabled(true);
      } catch (err) {
        if (err.response) {
          const errorMsg = err.response.data.error;
          if (errorMsg.includes("Usuário não encontrado")) {
            setErrors("Usuário inválido");
            setSucess("");
          } else {
            setErrors(errorMsg);
            setSucess("");
          }
        }
      }
    } else {
      setSucess("");
    }
  };

  return (
    <div className="recoverPage d-flex flex-column">
      <Header></Header>
      <div className="container resgisterPage flex-grow-1 d-flex justify-content-center align-items-center">
        <div className="col-md-6 mx-auto">
          <h1 className="text-center my-4">Recuperar Senha</h1>
          <p className="mx-5">
            Informe seu email no campo abaixo e enviaremos um email para
            recuperar sua senha
          </p>
          <div className="mx-5">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={userMail}
              onChange={handleFormChanges}
            />
            <p style={{ color: "red" }} className="p-0 m-0">
              {errors}
            </p>
            <p style={{ color: "green" }} className="p-0 m-0">
              {sucess}
            </p>
            <div className="d-flex justify-content-center">
              <button
                className="registerButton my-3 d-flex justify-content-center"
                onClick={submitForm}
                disabled={buttonDisabled}
              >
                Recuperar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Footer></Footer>
      </div>
    </div>
  );
}

export default Login;
