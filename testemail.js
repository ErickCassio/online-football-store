const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Configuração do transportador para o Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // seu email do Outlook
    pass: process.env.EMAIL_PASS, // sua senha do Outlook
  },
});
// Função para enviar o email de verificação
function enviarEmailVerificacao(emailUsuario, nickname, tokenVerificacao) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emailUsuario,
    subject: "Confirmação de Email",
    text: `Olá, ${nickname}!

        Sua conta na ZZFutebolStore está quase pronta. Para ativá-la, por favor confirme o seu endereço de email clicando no link abaixo.

        Confirmar Email: http://localhost:5000/api/confirmacao/${tokenVerificacao}.

        Sua conta não será ativada até que seu email seja confirmado.

        Se você não se cadastrou na ZZFutebolStore recentemente, por favor ignore este email.

        Desde já agradecemos pela preferência,

        ZZFutebolStore`,
    html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmação de Email</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                a[href] {
                    color: #ffffff;
                }

                .container {
                    background-color: #fff;
                    padding: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    border-radius: 8px;
                    text-align: center;
                    max-width: 600px;
                    width: 100%;
                }
                .header {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                .content {
                    margin-bottom: 20px;
                }
                .button {
                    background-color: #007bff;
                    color: #ffffff;
                    padding: 15px 25px;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;
                    margin: 20px 0;
                    font-size: 16px;
                }
                .footer {
                    margin-top: 20px;
                    color: #888;
                    font-size: 12px;
                }
                .note {
                    margin-top: 20px;
                    color: #888;
                    font-size: 14px;
                }
                .link {
                    color: #007bff;
                    word-wrap: break-word;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">ZZFutebolStore</div>
                <div class="content">
                    <p>Olá, ${nickname}!</p>
                    <p>Sua conta na ZZFutebolStore está quase pronta. Para ativá-la, por favor confirme o seu endereço de email clicando no link abaixo.</p>
                    <a href="http://localhost.com:5000/api/confirmacao/${tokenVerificacao}" class="button">Confirmar meu email</a>
                </div>
                <div class="footer">
                    <p>Caso o link acima não funcione, copie e cole este endereço no seu navegador:</p>
                    <p class="link">http://localhost.com:5000/api/confirmacao/${tokenVerificacao}</p>
                    <p>Se você não se cadastrou nesse site, ignore este email.</p>
                </div>
            </div>
        </body>
        </html>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error("Erro ao enviar email de verificação:", error);
    } else {
      console.log("Email de verificação enviado para:", emailUsuario);
    }
  });
}
const userId = 1;
const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" }); // Definindo o token para 7 dias

// Calcula a data de expiração
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7);

const email = "erickebb15@gmail.com";
const nickname = "Erick";

// Envia o email de verificação
enviarEmailVerificacao(email, nickname, token);
