// server.js (revisi)
import express from 'express';
import mysql from 'mysql2/promise';

// Inisialisasi aplikasi Express
const app = express();
const port = process.env.PORT || 3000; // Port dari environment atau default 3000

// Middleware untuk membaca body JSON dari request
app.use(express.json());

// Fungsi untuk koneksi ke database (diambil dari db.js Anda)
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

// Endpoint untuk membuat laporan baru (sudah direvisi)
app.post('/api/laporan', async (req, res) => {
  // Mengambil data dari body request
  const { userID, prioritas, deskripsi } = req.body;

  // Validasi: userID dan prioritas wajib ada
  if (!userID || !prioritas) {
    return res.status(400).json({ message: 'Error: Field userID dan prioritas wajib diisi.' });
  }

  let connection;
  try {
    connection = await connectDB();
    // Query disesuaikan dengan kolom tabel Anda
    const query = 'INSERT INTO laporan (userID, prioritas, deskripsi, status) VALUES (?, ?, ?, ?)';
    
    // Jika deskripsi tidak ada, gunakan nilai default
    const deskripsiLaporan = deskripsi || 'Laporan darurat dari tombol panik.';
    const statusLaporan = 'baru'; // Status default
    
    await connection.execute(query, [userID, prioritas, deskripsiLaporan, statusLaporan]);
    await connection.end(); // Tutup koneksi
    
    res.status(201).json({ message: 'Laporan berhasil disimpan ke MySQL!' });
  } catch (error) {
    console.error('Database Error:', error);
    if (connection) await connection.end(); // Pastikan koneksi ditutup jika ada error
    res.status(500).json({ message: 'Gagal menyimpan laporan ke database.' });
  }
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});