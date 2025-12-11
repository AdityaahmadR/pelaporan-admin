// src/app/api/edukasi/route.js
import connectDB from "@/lib/db";

// PERBAIKAN #1: Mencegah Vercel melakukan build statis pada route ini.
export const dynamic = 'force-dynamic';

// --- FUNGSI GET (Ambil daftar Video) ---
export async function GET() {
  let connection;
  try {
    connection = await connectDB();
    
    const query = "SELECT * FROM edukasi WHERE kategori = 'video' ORDER BY tanggalPublikasi DESC";
    const [rows] = await connection.query(query);

    // PERBAIKAN #2: Gunakan new Response() seperti file lain yang sudah berhasil.
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("❌ Error GET /api/edukasi:", error);
    // PERBAIKAN #2: Gunakan new Response() juga untuk error.
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    if (connection) await connection.end();
  }
}

// --- FUNGSI POST (Simpan Data) ---
export async function POST(request) {
  let connection;
  try {
    const { judul, isi, kategori } = await request.json();

    if (!isi || !kategori) {
      // PERBAIKAN #2: Gunakan new Response()
      return new Response(JSON.stringify({ message: "Data tidak lengkap" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    connection = await connectDB();

    const query = "INSERT INTO edukasi (judul, isi, kategori) VALUES (?, ?, ?)";
    await connection.query(query, [judul, isi, kategori]);

    // PERBAIKAN #2: Gunakan new Response()
    return new Response(JSON.stringify({ message: "Berhasil disimpan" }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("❌ Error POST /api/edukasi:", error);
    // PERBAIKAN #2: Gunakan new Response()
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    if (connection) await connection.end();
  }
}