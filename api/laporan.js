// api/laporan.js (Versi Super-Debug)
import connectDB from '../admin-api/db.js';

export default async function handler(req, res) {
  // Log ini akan muncul di dashboard Vercel Anda
  console.log("--- FUNGSI LAPORAN (SUPER-DEBUG) DIPANGGIL ---");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Request Body Diterima:", JSON.stringify(req.body));

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Kita akan memaksa SEMUA nilai untuk tes terakhir ini
  const testUserID = req.body.userID || 99; // Gunakan 99 jika userID tidak terbaca
  const testPrioritas = 'darurat';
  const testDeskripsi = 'FINAL TEST: Kode baru ini sudah berjalan.';
  const testStatus = 'baru';

  console.log("Nilai yang akan dimasukkan:", { testUserID, testPrioritas, testDeskripsi, testStatus });

  let connection;
  try {
    console.log("Mencoba koneksi ke DB...");
    connection = await connectDB();
    console.log("Koneksi DB berhasil.");
    
    const query = 'INSERT INTO laporan (userID, prioritas, deskripsi, status) VALUES (?, ?, ?, ?)';
    
    await connection.execute(query, [testUserID, testPrioritas, testDeskripsi, testStatus]);
    console.log("Query berhasil dijalankan.");
    
    await connection.end();
    
    // Pesan sukses yang SANGAT BERBEDA untuk bukti
    res.status(200).json({ 
        success: true, 
        message: 'VERSI SUPER-DEBUG BERHASIL! Cek DB & Log Vercel.' 
    });

  } catch (error) {
    console.error('--- ❌ ERROR DI SUPER-DEBUG ❌ ---', error);
    if (connection) await connection.end();
    res.status(500).json({ success: false, message: 'Error dari versi Super-Debug.', error: error.message });
  }
}
