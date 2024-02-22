const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

const storage = new Storage();

// Middleware para permitir CORS usando o pacote cors
app.use(cors());

app.get('/api/images/:league/', async (req, res) => {
  const { league, team } = req.params;
  const bucketName = 'zzfutebolstore';
  const prefix = `images/Camisas/${league}/`;

  try {
    const [files] = await storage.bucket(bucketName).getFiles({ prefix });
    console.log("Files: ", files);
    const imageUrls = files.map(file => `https://storage.googleapis.com/${bucketName}/${file.name}`);
    res.json(imageUrls);
  } catch (error) {
    console.error('Erro ao listar as imagens:', error);
    res.status(500).send('Erro ao listar as imagens');
  }
});

app.get('/data', (req, res) => {
  const randomNumber = Math.floor(Math.random() * 100);
  res.json({ number: randomNumber });
});

app.get('/', (req, res) => {
  res.send("Right");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
