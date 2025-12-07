// src/app/api/laporan/darurat/route.js (Versi Final dengan Logika Lokasi)

// Path import ini mungkin perlu Anda sesuaikan lagi jika struktur berubah
import connectDB from '../../../../../../admin-api/src/app/lib/db.js';

// Di Next.js App Router, nama fungsi harus POST, PUT, GET, dll.
export async function POST(req) {

  // --- PERUBAHAN: Menambahkan 'lokasi' saat mengambil data ---
  const { userID, prioritas, deskripsi, lokasi } = await req.json();

  // Validasi dasar tidak berubah
  if (!userID || !prioritas) {
    return new Response(
      JSON.stringify({ message: 'Error: Field userID dan prioritas wajib diisi.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let connection;
  try {
    connection = await connectDB();

    // --- PERUBAHAN: Menambahkan kolom 'lokasi' ke dalam query INSERT ---
    const query = 'INSERT INTO laporan (userID, prioritas, deskripsi, status, lokasi) VALUES (?, ?, ?, ?, ?)';

    const deskripsiLaporan = deskripsi || 'Laporan darurat dari tombol panik.';
    const statusLaporan = 'baru';

    // --- PERUBAHAN: Menambahkan variabel 'lokasi' ke dalam execute ---
    // Jika 'lokasi' kosong atau null dari aplikasi, akan disimpan sebagai NULL di DB
    await connection.execute(query, [userID, prioritas, deskripsiLaporan, statusLaporan, lokasi]);

    await connection.end();

    // Pesan sukses diubah untuk konfirmasi
    return new Response(
      JSON.stringify({ success: true, message: 'Laporan darurat (dengan lokasi) berhasil disimpan!' }),
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