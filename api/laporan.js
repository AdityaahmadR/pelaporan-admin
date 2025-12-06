// api/laporan.js (Versi Final yang Benar)
import connectDB from '../admin-api/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

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
    
    // Menjalankan query dengan data yang diterima dari aplikasi Android
    await connection.execute(query, [userID, prioritas, deskripsiLaporan, statusLaporan]);
    
    await connection.end();
    
    res.status(201).json({ success: true, message: 'Laporan berhasil disimpan ke database!' });

  } catch (error) {
    console.error('❌ Terjadi error saat menyimpan laporan:', error);
    if (connection) await connection.end();
    res.status(500).json({ success: false, message: 'Gagal menyimpan laporan ke database.', error: error.message });
  }
}