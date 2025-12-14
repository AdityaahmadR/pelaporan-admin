import connectDB from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  let connection;
  try {
    connection = await connectDB();
    const query = "SELECT * FROM edukasi WHERE kategori = 'video' ORDER BY tanggalPublikasi DESC";
    const [rows] = await connection.query(query);
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

export async function POST(request) {
  let connection;
  try {
    // Vercel memiliki limit body size 4.5MB. Jika video > 4.5MB, request ini akan gagal otomatis dari server.
    const body = await request.json();
    const { judul, isi, kategori, thumbnail, link } = body;

    if (!isi || !kategori) {
      return new Response(JSON.stringify({ message: "Data tidak lengkap" }), { status: 400 });
    }

    connection = await connectDB();
    const query = "INSERT INTO edukasi (judul, isi, kategori, thumbnail, link) VALUES (?, ?, ?, ?, ?)";
    
    await connection.query(query, [judul, isi, kategori, thumbnail || null, link || null]);

    return new Response(JSON.stringify({ message: "Berhasil disimpan" }), { status: 200 });
  } catch (error) {
    console.error("Error POST:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}