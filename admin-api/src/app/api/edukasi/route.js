import connectDB from "@/lib/db";
import { NextResponse } from "next/server";

// 1. GET: Ambil daftar Video untuk ditampilkan
export async function GET() {
  let connection;
  try {
    connection = await connectDB();
    
    // Ambil data kategori 'video', urutkan dari yang terbaru
    const query = "SELECT * FROM edukasi WHERE kategori = 'video' ORDER BY tanggalPublikasi DESC";
    const [rows] = await connection.query(query);

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// 2. POST: Simpan Data Video atau Link Berita
export async function POST(request) {
  let connection;
  try {
    const body = await request.json();
    const { judul, isi, kategori } = body;

    // Validasi input
    if (!isi || !kategori) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    connection = await connectDB();

    // Insert ke tabel edukasi
    const query = "INSERT INTO edukasi (judul, isi, kategori) VALUES (?, ?, ?)";
    await connection.query(query, [judul, isi, kategori]);

    return NextResponse.json({ message: "Berhasil disimpan" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}