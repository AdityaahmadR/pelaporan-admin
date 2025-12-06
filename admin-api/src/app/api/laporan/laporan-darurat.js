// api/laporan.js (Versi yang Memaksa/Hardcode Prioritas)
import connectDB from '../admin-api/db.js'; // Pastikan path ini benar

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Mengambil userID & deskripsi, tapi mengabaikan prioritas dari aplikasi
  const { userID, deskripsi } = req.body;

  let connection;
  try {
    connection = await connectDB();
    
    const query = 'INSERT INTO laporan (userID, prioritas, deskripsi, status) VALUES (?, ?, ?, ?)';
    
    // Nilai-nilai yang akan dimasukkan ke database
    const idPengguna = userID || 1; // Jika userID tidak ada, gunakan 1
    const deskripsiLaporan = deskripsi || 'Laporan darurat dari tombol panik.';
    const statusLaporan = 'baru';
    
    // --- INI BAGIAN UTAMA: MEMAKSA NILAI PRIORITAS ---
    const prioritasWajib = 'darurat'; 
    
    // Menjalankan query dengan nilai prioritas yang sudah dipaksa
    await connection.execute(query, [idPengguna, prioritasWajib, deskripsiLaporan, statusLaporan]);
    
    await connection.end();
    
    // Mengirim pesan sukses
    res.status(201).json({ success: true, message: 'Laporan (Forced Darurat) berhasil disimpan!' });

  } catch (error) {
    console.error('❌ Terjadi error saat menyimpan laporan:', error);
    if (connection) await connection.end();
    res.status(500).json({ success: false, message: 'Gagal menyimpan laporan ke database.', error: error.message });
  }
}