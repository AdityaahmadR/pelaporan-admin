// File: src/app/api/notifikasi/[userID]/route.js (VERSI DEBUGGING FINAL)

import connectDB from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  // --- LANGKAH DEBUGGING UTAMA ---
  console.log("[LOG] Request diterima. Seluruh objek params:", JSON.stringify(params, null, 2));

  // --- PERBAIKAN: Akses langsung, hindari destructuring ---
  const userIDString = params.userID;
  console.log(`[LOG] Mencoba membaca userID dari params: '${userIDString}'`);

  let connection;

  if (!userIDString || userIDString === 'undefined') {
    console.log("[ERROR] Gagal mendapatkan userID dari params. Pastikan nama folder adalah [userID].");
    return new Response(JSON.stringify({ message: "UserID tidak terdeteksi di URL." }), { status: 400 });
  }

  const userID = parseInt(userIDString, 10);
  if (isNaN(userID)) {
      console.log(`[ERROR] UserID '${userIDString}' bukan angka yang valid.`);
      return new Response(JSON.stringify({ message: `UserID '${userIDString}' tidak valid.` }), { status: 400 });
  }
  console.log(`[LOG] Berhasil mem-parsing userID sebagai angka: ${userID}`);

  try {
    connection = await connectDB();
    console.log("[LOG] Koneksi ke database berhasil.");
    
    const query = "SELECT * FROM notifikasi WHERE penerimaID = ? ORDER BY waktuKirim DESC";
    console.log(`[LOG] Menjalankan query: ${query} dengan userID: ${userID}`);

    const [rows] = await connection.query(query, [userID]);
    console.log(`[LOG] Query selesai. Ditemukan ${rows.length} baris data.`);

    // Mengubah nama kolom agar sesuai dengan yang diharapkan aplikasi Android
    const formattedRows = rows.map(row => ({
      judul: 'Notifikasi', // Judul default
      isi: row.isiPesan,
      tanggal: row.waktuKirim,
      tipe: row.tipe || 'default', 
      contentID: row.contentID || '' 
    }));
    
    return new Response(JSON.stringify(formattedRows), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error(`❌ GAGAL TOTAL GET /api/notifikasi/${userID}:`, error);
    return new Response(JSON.stringify({ 
      error: "Pengecualian di sisi server",
      message: error.message 
    }), { status: 500 });
  
  } finally {
    if (connection) {
      await connection.end();
      console.log("[LOG] Koneksi database ditutup.");
    }
  }
}