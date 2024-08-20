import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { useParams } from "react-router-dom";

function Validate() {
  const { token } = useParams(); // Obtém o token da URL
  const [status, setStatus] = useState("loading"); // Estado para armazenar o status da validação

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Faz a requisição para a API de validação de email
        const response = await api.get(`/confirmacao/${token}`);

        // Atualiza o estado com a mensagem de sucesso
        setStatus("success");
      } catch (error) {
        // Atualiza o estado com base no erro retornado pelo servidor
        if (error.response) {
          if (error.response.status === 400) {
            const errorMsg = error.response.data.error;
            if (errorMsg.includes("expirado")) {
              return setStatus("expired");
            } else if (errorMsg.includes("inválido")) {
              return setStatus("invalid");
            }
          } else {
            return setStatus("invalid");
          }
        } else {
          return setStatus("error");
        }
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token]); // Dependência do token para refazer a requisição se mudar

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-8 text-center p-3 border rounded bg-white shadow-sm">
          {status === "loading" && <p>Validando seu email...</p>}
          {status === "success" && (
            <>
              <h2 className="mb-4">Confirmação de Email</h2>
              <p className="mb-4">
                Seu endereço de email foi verificado com sucesso. Agora você
                pode fazer login e aproveitar todos os recursos da
                ZZFutebolStore.
              </p>
              <a href="/login" className="btn btn-primary">
                Ir para Login
              </a>
              <div className="mt-4 text-muted">
                Se você tiver problemas para fazer login, entre em contato com o
                suporte.
              </div>
            </>
          )}
          {status === "expired" && (
            <>
              <h2 className="mb-4">Token Expirado</h2>
              <p className="mb-4">
                O token de verificação do seu email expirou. Faça login
                novamente para receber um novo token.
              </p>
              <a href="/login" className="btn btn-primary">
                Ir para Login
              </a>
              <div className="mt-4 text-muted">
                Se você tiver problemas, entre em contato com o suporte.
              </div>
            </>
          )}
          {status === "invalid" && (
            <>
              <h2 className="mb-4">Token Inválido</h2>
              <p className="mb-4">
                O token de verificação do seu email é inválido. Verifique o link
                e tente novamente.
              </p>
              <a href="/" className="btn btn-primary">
                Voltar para a Página Inicial
              </a>
              <div className="mt-4 text-muted">
                Se você tiver problemas, entre em contato com o suporte.
              </div>
            </>
          )}
          {status === "error" && (
            <>
              <h2 className="mb-4">Erro na Confirmação</h2>
              <p className="mb-4">
                Ocorreu um erro inesperado ao verificar seu endereço de email.
                Por favor, tente novamente ou entre em contato com o suporte.
              </p>
              <a href="/" className="btn btn-primary">
                Voltar para a Página Inicial
              </a>
              <div className="mt-4 text-muted">
                Se você tiver problemas, entre em contato com o suporte.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Validate;
