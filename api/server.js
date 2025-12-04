// server.js (HANYA UNTUK TES DEPLOYMENT)
import express from 'express';
const app = express();
const port = process.env.PORT || 3000;

// Endpoint tes yang hanya merespons "Halo dari Railway!"
app.get('/', (req, res) => {
  res.status(200).send('Halo dari Railway! Deployment berhasil.');
});

app.listen(port, () => {
  console.log(`Server tes berjalan di port ${port}`);
});