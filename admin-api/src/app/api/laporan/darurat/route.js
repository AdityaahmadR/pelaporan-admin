// src/app/api/laporan/darurat/route.js (Versi Final dengan Path Benar)

// --- PATH IMPORT DIPERBAIKI ---
// Keluar 5 tingkat folder (darurat -> laporan -> api -> app -> src) untuk mencapai root, lalu masuk ke admin-api
import connectDB from '../../../../../../admin-api//src/app/lib/db.js'; 

// Di Next.js App Router, nama fungsi harus POST, PUT, GET, dll.
export async function POST(req) {
  
  // Mengambil data JSON dari body request
  const { userID, prioritas, deskripsi } = await req.json();

  // Validasi sederhana
  if (!userID || !prioritas) {
    return new Response(
      JSON.stringify({ message: 'Error: Field userID dan prioritas wajib diisi.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let connection;
  try {
    connection = await connectDB();
    
    const query = 'INSERT INTO laporan (userID, prioritas, deskripsi, status) VALUES (?, ?, ?, ?)';
    
    const deskripsiLaporan = deskripsi || 'Laporan darurat dari tombol panik.';
    const statusLaporan = 'baru';
    
    // Menjalankan query dengan data yang benar dari aplikasi Android
    await connection.execute(query, [userID, prioritas, deskripsiLaporan, statusLaporan]);
    
    await connection.end();
    
    // Mengirim respons sukses dengan format yang benar untuk Next.js App Router
    return new Response(
      JSON.stringify({ success: true, message: 'Laporan ini berhasil disimpan!' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Terjadi error saat menyimpan laporan:', error);
    if (connection) await connection.end();
    
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal menyimpan laporan ke database.', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}