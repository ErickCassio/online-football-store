import { React, useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import axios from "axios";

function Register() {
  const [userData, setUserData] = useState({
    name: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    nickname: "",
    email: "",
    password: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

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

  const submitForm = async () => {
    let hasErrors = false;
    let newErrors = {};

    if (userData.name.trim() === "") {
      //Verifies if name is empty
      newErrors.name = "Nome é obrigatório";
      hasErrors = true;
    }

    if (userData.nickname.trim() === "") {
      //Verifies if nickname is empty
      newErrors.nickname = "Apelido é obrigatório";
      hasErrors = true;
    }

    if (!validateEmail(userData.email)) {
      //Verifies if email is valid
      newErrors.email = "Email inválido";
      hasErrors = true;
    }

    if (!validatePassword(userData.password)) {
      //Verifies if password is strong
      newErrors.password = (
        <div>
          A senha precisa ter no mínimo: <br />
          - 6 caracteres <br />
          - Uma letra maiúscula <br />
          - Uma letra minúscula <br />- Um número e um caractere especial
        </div>
      );
      hasErrors = true;
    } else if (userData.password !== userData.confirmPassword) {
      newErrors.password = "As duas senhas precisam ser iguais";
      hasErrors = true;
    }

    setErrors(newErrors);

    if (!hasErrors) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/register",
          userData
        );

        // Define a mensagem de sucesso e limpa mensagens de erro
        setSuccessMessage("Cadastro realizado com sucesso!");
        setErrorMessage("");
      } catch (err) {
        // Define a mensagem de erro e limpa a mensagem de sucesso
        setSuccessMessage("");
        if (err.response && err.response.status === 400) {
          const errorResponse = err.response.data;
          if (
            errorResponse.error ===
            "Email já cadastrado. Prossiga para página de login."
          ) {
            setErrorMessage(errorResponse.error);
          } else {
            setErrorMessage(
              "Erro ao cadastrar usuário. Por favor, tente novamente mais tarde."
            );
          }
        } else {
          setErrorMessage(
            "Erro ao cadastrar usuário. Por favor, tente novamente."
          );
        }
      }
    } else {
      console.log("Formulário inválido, exibindo erros...");
    }
  };

  return (
    <div>
      <Header></Header>
      <div className="container resgisterPage">
        <div className="col-md-6 mx-auto">
          {successMessage && !errorMessage ? (
            <div>
              <div>
                {/* Creates a blank space abobve */}
                <div style={{ height: "20vh" }}></div>
              </div>
              <div className="alert alert-success text-center" role="alert">
                <b>{successMessage}</b>
                <p>Verifique seu email para ativar sua conta</p>
                <p>
                  Se não encontrar nosso email, verifique na caixa de "Spam"
                </p>
              </div>
              <div>
                {/* Creates a blank space behind */}
                <div style={{ height: "25vh" }}></div>
              </div>
            </div>
          ) : errorMessage ? (
            <div>
              <div>
                {/* Creates a blank space abobve */}
                <div style={{ height: "30vh" }}></div>
              </div>
              <div className="alert alert-danger text-center" role="alert">
                {errorMessage}
              </div>
              <div>
                {/* Creates a blank space behind */}
                <div style={{ height: "35vh" }}></div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-center my-4">Criar conta</h1>
              <div className="mx-5">
                <label htmlFor="name">Nome</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={userData.name}
                  onChange={handleFormChanges}
                />
                {errors.name && (
                  <span className="text-danger">{errors.name}</span>
                )}

                <label htmlFor="nickname">Apelido</label>
                <input
                  type="text"
                  name="nickname"
                  id="nickname"
                  value={userData.nickname}
                  onChange={handleFormChanges}
                />
                {errors.nickname && (
                  <span className="text-danger">{errors.nickname}</span>
                )}

                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={userData.email}
                  onChange={handleFormChanges}
                />
                {errors.email && (
                  <span className="text-danger">{errors.email}</span>
                )}
                <label htmlFor="password">Senha</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={userData.password}
                  onChange={handleFormChanges}
                />
                {errors.password && (
                  <span className="text-danger">{errors.password}</span>
                )}

                <label htmlFor="confirmPassword">Confirme a senha</label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={userData.confirmPassword}
                  onChange={handleFormChanges}
                />

                <div className="d-flex justify-content-center">
                  <button
                    className="registerButton my-4 d-flex justify-content-center"
                    onClick={submitForm}
                  >
                    Registrar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default Register;
