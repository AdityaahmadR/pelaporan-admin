// File: src/app/api/notifikasi/[userID]/route.js (DEBUGGING VERSION)
import connectDB from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { userID: userIDString } = params; // Ambil userID sebagai string
  console.log(`[LOG] Menerima permintaan untuk userID: '${userIDString}'`);

  let connection;

  if (!userIDString) {
    console.log("[ERROR] UserID tidak ada dalam permintaan.");
    return new Response(JSON.stringify({ message: "UserID tidak valid." }), { status: 400 });
  }

  // --- LANGKAH DEBUGGING 1: Pastikan userID adalah angka ---
  const userID = parseInt(userIDString, 10);
  if (isNaN(userID)) {
      console.log(`[ERROR] Gagal mengubah userID menjadi angka: '${userIDString}'`);
      return new Response(JSON.stringify({ message: `UserID '${userIDString}' tidak valid.` }), { status: 400 });
  }
  console.log(`[LOG] Berhasil mengubah userID menjadi angka: ${userID}`);

  try {
    connection = await connectDB();
    console.log("[LOG] Koneksi ke database berhasil.");
    
    const query = "SELECT * FROM notifikasi WHERE penerimaID = ? ORDER BY waktuKirim DESC";
    console.log(`[LOG] Menjalankan query: ${query} dengan userID: ${userID}`);

    const [rows] = await connection.query(query, [userID]);
    console.log(`[LOG] Query mengembalikan ${rows.length} baris data.`);

    // Jika masih 0, masalahnya kemungkinan besar ada pada koneksi DB di Vercel
    if (rows.length === 0) {
        console.log("[PERINGATAN] Query mengembalikan 0 baris. Periksa variabel koneksi database di Vercel dan pastikan data untuk ID ini ada di database produksi.");
    }
    
    // Kirim data mentah untuk memastikan query-nya benar
    return new Response(JSON.stringify(rows), { 
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