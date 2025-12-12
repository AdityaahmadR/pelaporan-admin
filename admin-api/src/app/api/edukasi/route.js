import connectDB from "@/lib/db";
import { NextResponse } from "next/server";

// Mencegah Vercel melakukan build statis pada route ini.
export const dynamic = 'force-dynamic';

// --- FUNGSI GET (Ambil daftar Video) ---
export async function GET() {
  let connection;
  try {
    connection = await connectDB();
    
    // Pastikan kolom thumbnail ikut diambil
    const query = "SELECT * FROM edukasi WHERE kategori = 'video' ORDER BY tanggalPublikasi DESC";
    const [rows] = await connection.query(query);

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("❌ Error GET /api/edukasi:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    if (connection) await connection.end();
  }
}

// --- FUNGSI POST (Simpan Data & Thumbnail) ---
export async function POST(request) {
  let connection;
  try {
    // 1. Terima data thumbnail dari body request
    const { judul, isi, kategori, thumbnail } = await request.json();

    if (!isi || !kategori) {
      return new Response(JSON.stringify({ message: "Data tidak lengkap" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    connection = await connectDB();

    // 2. Masukkan ke Query Insert
    // Jika thumbnail tidak ada, isi dengan NULL
    const query = "INSERT INTO edukasi (judul, isi, kategori, thumbnail) VALUES (?, ?, ?, ?)";
    
    await connection.query(query, [judul, isi, kategori, thumbnail || null]);

    return new Response(JSON.stringify({ message: "Berhasil disimpan" }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("❌ Error POST /api/edukasi:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    if (connection) await connection.end();
  }
}