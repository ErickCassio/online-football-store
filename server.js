const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt"); //Algorithm that criptograph the password
const jwt = require("jsonwebtoken"); //Token generator for user authentication
const nodemailer = require("nodemailer"); //Tool for send mail to user
const app = express();
const PORT = process.env.PORT || 5000;
const { Storage } = require("@google-cloud/storage");
const { Client } = require("pg");
require("dotenv").config();

// Configuração do cliente PostgreSQL
const client = new Client({
  host: process.env.DB_HOST,
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

const storage = new Storage();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // seu email do Outlook
    pass: process.env.EMAIL_PASS, // sua senha do Outlook
  },
});
// Função para enviar o email de verificação
function enviarEmailVerificacao(emailUsuario, nickname, tokenVerificacao) {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: emailUsuario,
      subject: "Confirmação de Email",
      text: `Olá, ${nickname}!

      Sua conta na ZZFutebolStore está quase pronta. Para ativá-la, por favor confirme o seu endereço de email clicando no link abaixo.

      Confirmar Email: ${process.env.PAGE_URL}confirmacao/${tokenVerificacao}.

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
                  <a href="${process.env.PAGE_URL}confirmacao/${tokenVerificacao}" class="button">Confirmar meu email</a>
              </div>
              <div class="footer">
                  <p>Caso o link acima não funcione, copie e cole este endereço no seu navegador:</p>
                  <p class="link">${process.env.PAGE_URL}confirmacao/${tokenVerificacao}</p>
                  <p>Se você não se cadastrou nesse site, ignore este email.</p>
              </div>
          </div>
      </body>
      </html>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Erro ao enviar email de verificação:", error);
        reject(error); // Rejeita a promessa com o erro
      } else {
        console.log("Email de verificação enviado para:", emailUsuario);
        resolve(info); // Resolve a promessa com as informações do email
      }
    });
  });
}

// Configuração do CORS para permitir apenas o domínio do frontend
const corsOptions = {
  origin: [
    "https://www.zzfutebolstore.com",
    "https://online-football-store.vercel.app",
    "https://online-football-store-erickcassios-projects.vercel.app",
    "https://online-football-store-git-main-erickcassios-projects.vercel.app",
  ], // Substitua pelo URL do seu frontend
  methods: "GET,POST,PUT,DELETE", // Métodos permitidos
  allowedHeaders: "Content-Type,Authorization", // Cabeçalhos permitidos
};

app.use(cors(corsOptions));

// Middleware for parsing JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Function to connect to the database
async function connectToDatabase() {
  try {
    console.log("Attempting to connect to the database...");
    await client.connect();
    console.log("Successfully connected!");
  } catch (err) {
    console.error("Error connecting to the database", err);
  }
}

connectToDatabase();

app.get("/api/images/:league/", async (req, res) => {
  const { league } = req.params;

  try {
    // Execute the search for every product where class = league
    const result = await client.query(
      "SELECT id, name, type, team, url, price FROM products WHERE class = $1",
      [league]
    );

    // Return everything except the column class
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar produtos", error);
    res.status(500).send("Erro ao buscar produtos");
  }
});

app.get("/api/search/:product/", async (req, res) => {
  const { product } = req.params;
  try {
    const query = `
      SELECT *
      FROM products
      WHERE name ILIKE $1
    `;
    const values = [`%${product}%`];
    const result = await client.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar produto específico", error);
    res.status(500).send("Erro ao buscar produto específico");
  }
});

app.get("/api/searchById/:productId/", async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await client.query("SELECT * FROM products WHERE id = $1", [
      productId,
    ]);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar produto por ID", error);
    res.status(500).send("Erro ao buscar produto por ID");
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Verifica se o usuário existe na tabela users
    const user = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Verifica a senha utilizando bcrypt
    const passwordMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Senha incorreta." });
    }

    //Verifica se o email do usuário está verificado
    if (!user.rows[0].is_verified) {
      return res.status(400).json({ error: "Usuário não verificado." });
    }

    // Gerar um token JWT válido por uma semana
    const token = jwt.sign(
      { userId: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Retorna uma resposta de sucesso
    res.status(200).json({ message: "Login bem-sucedido!", token });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao fazer login. Tente novamente mais tarde." });
  }
});

app.post("/api/register", async (req, res) => {
  const { name, nickname, email, password } = req.body;

  try {
    // Verifica se já existe um usuário com o mesmo email
    const existingUser = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Email já cadastrado. Por favor, escolha outro." });
    }

    // Hash da senha utilizando bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 é o número de salt rounds

    // Insere o novo usuário na tabela users
    const newUser = await client.query(
      "INSERT INTO users (name, nickname, email, password, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name, nickname, email, hashedPassword, false]
    );
    const userId = newUser.rows[0].id;

    // Cria um token de verificação com JWT
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    }); // Definindo o token para 7 dias

    // Calcula a data de expiração
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Insere o token na tabela email_verification
    await client.query(
      "INSERT INTO email_verification (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, token, expiresAt]
    );

    try {
      await enviarEmailVerificacao(email, nickname, token);
      res.status(201).json({
        message:
          "Usuário registrado com sucesso. Verifique seu email para ativar sua conta.",
      });
    } catch (emailError) {
      console.error("Erro ao enviar email de verificação:", emailError);
      // Remove o envio da resposta duplicada
      res.status(500).json({
        error:
          "Erro ao enviar o email de verificação. Tente novamente mais tarde.",
      });
    }
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({
      error: "Erro ao registrar usuário. Tente novamente mais tarde.",
    });
  }
});

app.get("/api/confirmacao/:token", async (req, res) => {
  const { token } = req.params;
  try {
    // Decodifica o token usando a chave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verifique se o token contém o campo userId
    if (!decoded.userId) {
      return res.status(400).json({ error: "Token de verificação inválido." });
    }

    const userId = decoded.userId;

    // Verifica se o token existe na tabela email_verification
    const result = await client.query(
      "SELECT * FROM email_verification WHERE token = $1",
      [token]
    );
    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Token de verificação não definido" });
    }

    // Verifica se o token expirou
    const { expires_at, user_id } = result.rows[0];
    if (new Date() > new Date(expires_at)) {
      return res.status(400).json({ error: "Token de verificação expirado." });
    }

    // Verifica se o userId no token corresponde ao userId no banco de dados
    if (userId !== user_id) {
      return res.status(400).json({ error: "Token de verificação inválido." });
    }

    // Marca o usuário como verificado na tabela users
    await client.query("UPDATE users SET is_verified = true WHERE id = $1", [
      userId,
    ]);

    // Remove o token da tabela email_verification
    await client.query("DELETE FROM email_verification WHERE token = $1", [
      token,
    ]);

    res.status(200).json({
      message: "Email verificado com sucesso. Agora você pode fazer login.",
    });
  } catch (error) {
    console.log("Erro ao verificar email:", error);
    res
      .status(500)
      .json({ error: "Erro ao verificar email. Tente novamente mais tarde." });
  }
});

// Nova rota para reautenticação de usuários
app.post("/api/reAuthUser", async (req, res) => {
  const { email } = req.body;

  try {
    // Verifica se o usuário existe na tabela users e não está verificado
    const userResult = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const user = userResult.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ error: "Usuário já verificado." });
    }

    const userId = user.id;
    const nickname = user.nickname;

    // Cria um novo token de verificação com JWT
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Calcula a data de expiração
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Insere o novo token na tabela email_verification
    await client.query(
      "INSERT INTO email_verification (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, token, expiresAt]
    );

    // Envia o email de verificação com o novo token
    await enviarEmailVerificacao(email, nickname, token);
    res
      .status(200)
      .json({ message: "Email de verificação reenviado com sucesso." });
  } catch (error) {
    console.error("Erro ao reenviar email de verificação:", error);
    res.status(500).json({
      error:
        "Erro ao reenviar email de verificação. Tente novamente mais tarde.",
    });
  }
});

app.post("/api/requestPasswordReset", async (req, res) => {
  const { email } = req.body;

  try {
    // Verifica se o usuário existe
    const user = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const userId = user.rows[0].id;
    const userNickName = user.rows[0].nickname;

    // Gera um token de recuperação e sua data de expiração
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expira em 1 hora
    const token = jwt.sign(
      { userId, type: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Salva o token e sua data de expiração na tabela password_resets
    await client.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, token, expiresAt]
    );

    // Envia o e-mail com o link de recuperação
    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: "Recuperação de Senha",
      html: `<!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperar a senha</title>
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
                  <p>Olá, ${userNickName}!</p>
                  <p>Para alterar sua senha prossiga para nosso site através do botão abaixo.</p>
                  <a href="${process.env.PAGE_URL}resetPassword/${token}" class="button">Redefinir a senha</a>
              </div>
              <div class="footer">
                  <p>Caso o botão acima não funcione, copie e cole este endereço no seu navegador:</p>
                  <p class="link">${process.env.PAGE_URL}resetPassword/${token}</p>
                  <p>Se você não se cadastrou nesse site, ignore este email.</p>
              </div>
          </div>
      </body>
      </html>`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "E-mail de recuperação enviado com sucesso." });
  } catch (error) {
    console.error("Erro ao solicitar recuperação de senha:", error);
    res.status(500).json({ error: "Erro ao solicitar recuperação de senha." });
  }
});

app.post("/api/verifyToken/:token", async (req, res) => {
  const { token } = req.params;

  try {
    // Decodifica o token usando a chave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verifique se o token contém o campo userId
    if (!decoded.userId) {
      return res.status(400).json({ error: "Token de verificação inválido." });
    }

    const userId = decoded.userId;

    // Verifica se o token existe na tabela password_resets
    const result = await client.query(
      "SELECT * FROM password_resets WHERE token = $1",
      [token]
    );
    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Token de verificação não definido" });
    }

    // Verifica se o token expirou
    const { expires_at, user_id } = result.rows[0];
    if (new Date() > new Date(expires_at)) {
      return res.status(400).json({ error: "Token de verificação expirado." });
    }

    // Verifica se o userId no token corresponde ao userId no banco de dados
    if (userId !== user_id) {
      return res.status(400).json({ error: "Token de verificação inválido." });
    }

    // Remove o token da tabela password_resets
    await client.query("DELETE FROM password_resets WHERE token = $1", [token]);

    // Permite o usuário alterar sua senha
    res.status(200).json({
      message: "Token válido, prossiga para alterar sua senha.",
    });
  } catch (error) {
    console.log("Erro ao verificar token:", error);
    res.status(500).json({
      error: "Erro ao verificar token. Tente novamente mais tarde.",
    });
  }
});

app.post("/api/resetPassword/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Decodifica o token usando a chave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verifique se o token contém o campo userId
    if (!decoded.userId) {
      console.log("Token inválido");
      return res.status(400).json({ error: "Token de verificação inválido." });
    }

    const userId = decoded.userId;

    // Hash da nova senha utilizando bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualiza a senha no banco de dados
    await client.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);

    // Retorna uma resposta de sucesso
    res.status(200).json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    console.log("Erro ao alterar senha:", error);
    res.status(500).json({
      error: "Erro ao alterar senha. Tente novamente mais tarde.",
    });
  }
});

app.get("/api/userData/:token", async (req, res) => {
  const { token } = req.params;
  try {
    // Decodifica o token usando a chave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Verifique se o token contém o campo userId
    if (!decoded.userId) {
      console.log("Token de verificação inválido.");
      return res.status(400).json({ error: "Token de verificação inválido." });
    }
    const userId = decoded.userId;

    //Busca pelo usuário no banco de dados
    const result = await client.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (result.rows.length === 0) {
      console.log("Usuário não encontrado");
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    // Envia o nickName para o frontend
    const { nickname } = result.rows[0];
    res.status(200).json({ nickname });
  } catch (error) {
    console.log("Erro na rota /api/userData");
    res.status(500).json({
      error: "Erro ao obter informações do usuário",
    });
  }
});

app.post("/api/cart/:token", async (req, res) => {
  const { token } = req.params;
  const { productId, size, customization, customDetails, price, quantity } =
    req.body;

  try {
    // Decodificar o token usando a chave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar se o token contém o userId
    if (!decoded.userId) {
      return res.status(400).json({ error: "Invalid token." });
    }

    const userId = decoded.userId;

    // Iniciar uma transação
    await client.query("BEGIN");

    // Verificar se o item já existe no carrinho
    const existingItem = await client.query(
      `SELECT id, quantity 
       FROM cart 
       WHERE user_id = $1 
         AND productId = $2 
         AND size = $3 
         AND price = $4 
         AND customDetails = $5 
       FOR UPDATE`,
      [userId, productId, size, price, customDetails]
    );

    if (existingItem.rows.length > 0) {
      // Se o item existir, atualizar a quantidade
      await client.query(
        `UPDATE cart 
         SET quantity = quantity + $1 
         WHERE id = $2`,
        [quantity, existingItem.rows[0].id]
      );
      res
        .status(200)
        .json({ message: "Item quantity updated in cart successfully." });
    } else {
      // Se o item não existir, inserir um novo item
      await client.query(
        `INSERT INTO cart 
         (user_id, productId, size, customization, customDetails, price, quantity) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, productId, size, customization, customDetails, price, quantity]
      );
      res.status(201).json({ message: "Item added to cart successfully." });
    }

    // Commit da transação
    await client.query("COMMIT");
  } catch (error) {
    // Rollback da transação em caso de erro
    await client.query("ROLLBACK");
    console.error("Error adding item to cart:", error);
    res.status(500).json({ error: "Error adding item to cart." });
  }
});

app.get("/api/cart/:token", async (req, res) => {
  const { token } = req.params;
  try {
    // Decode the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify if the token contains the userId
    if (!decoded.userId) {
      return res.status(400).json({ error: "Invalid token." });
    }

    const userId = decoded.userId;

    // Retrieve all cart items for the user
    const result = await client.query("SELECT * FROM cart WHERE user_id = $1", [
      userId,
    ]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error retrieving cart items:", error);
    res.status(500).json({ error: "Error retrieving cart items." });
  }
});

app.put("/api/cart/:token/item/:itemId", async (req, res) => {
  try {
    const { token, itemId } = req.params;
    const { quantity } = req.body;

    // Decode the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify if the token contains the userId
    if (!decoded.userId) {
      return res.status(400).json({ error: "Invalid token." });
    }

    const result = await client.query(
      `
      UPDATE cart
      SET quantity = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *;
    `,
      [quantity, itemId, decoded.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item não encontrado." });
    }

    return res.status(200).json({ message: "Quantidade alterada com sucesso" });
  } catch (error) {
    console.error("Erro ao remover item do carrinho:", error);
    return res
      .status(500)
      .json({ message: "Erro ao remover item do carrinho" });
  }
});

app.delete("/api/cart/:token/item/:itemId", async (req, res) => {
  try {
    const { token, itemId } = req.params;

    // Decode the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify if the token contains the userId
    if (!decoded.userId) {
      return res.status(400).json({ error: "Invalid token." });
    }

    const result = await client.query("DELETE FROM cart WHERE id = $1", [
      itemId,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item não encontrado." });
    }

    return res.status(200).json({ message: "Item removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover item do carrinho:", error);
    return res
      .status(500)
      .json({ message: "Erro ao remover item do carrinho" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
