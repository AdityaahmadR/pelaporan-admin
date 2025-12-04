// api/laporan.js (Versi Diagnostik)
import connectDB from '../admin-api/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Kita hanya akan mengambil userID dari aplikasi untuk tes ini
  const { userID, deskripsi } = req.body;

  let connection;
  try {
    connection = await connectDB();
    
    // Query tidak berubah, tetapi nilai yang kita masukkan akan diubah
    const query = 'INSERT INTO laporan (userID, prioritas, deskripsi, status) VALUES (?, ?, ?, ?)';
    
    const deskripsiLaporan = deskripsi || 'Laporan darurat dari tombol panik.';
    const statusLaporan = 'baru';
    // --- PERUBAHAN UTAMA: NILAI "darurat" DI-HARDCODE DI SINI ---
    const prioritasDarurat = 'darurat'; 
    
    // Menjalankan query dengan nilai prioritas yang sudah dipaksa
    await connection.execute(query, [userID, prioritasDarurat, deskripsiLaporan, statusLaporan]);
    
    await connection.end();
    
    // Mengirim pesan sukses yang berbeda untuk menandakan ini adalah tes
    res.status(201).json({ success: true, message: 'Laporan (tes hardcode) berhasil disimpan!' });

  } catch (error) {
    console.error('❌ Terjadi error saat menyimpan laporan:', error);
    if (connection) await connection.end();
    res.status(500).json({ success: false, message: 'Gagal menyimpan laporan ke database.', error: error.message });
  }
}