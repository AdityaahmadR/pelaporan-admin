// server.js (versi diagnostik sederhana)
import express from 'express';
import mysql from 'mysql2/promise';

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

async function connectDB() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: Number(process.env.MYSQLPORT),
  });
  return connection;
}

// ENDPOINT DIUBAH MENJADI "/"
app.post('/', async (req, res) => {
  const { userID, prioritas, deskripsi } = req.body;

  if (!userID || !prioritas) {
    return res.status(400).json({ message: 'Error: Field userID dan prioritas wajib diisi.' });
  }

  let connection;
  try {
    connection = await connectDB();
    const query = 'INSERT INTO laporan (userID, prioritas, deskripsi, status) VALUES (?, ?, ?, ?)';
    const deskripsiLaporan = deskripsi || 'Laporan darurat dari tombol panik.';
    const statusLaporan = 'baru';
    
    await connection.execute(query, [userID, prioritas, deskripsiLaporan, statusLaporan]);
    await connection.end();
    
    res.status(201).json({ message: 'DATA BERHASIL MASUK DARI ENDPOINT /' });
  } catch (error) {
    console.error('Database Error:', error);
    if (connection) await connection.end();
    res.status(500).json({ message: 'Gagal menyimpan laporan ke database.' });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port} dengan endpoint di "/"`);
});