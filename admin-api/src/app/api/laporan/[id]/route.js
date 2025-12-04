import connectDB from "@/lib/db";
import { NextResponse } from "next/server";

// 1. GET: Untuk mengambil detail laporan
export async function GET(request, { params }) {
  let connection;

  try {
    const { id } = params;

    // Langkah 1: Buka koneksi database
    connection = await connectDB();

    // Langkah 2: Query data dengan JOIN ke tabel users untuk dapat nama pelapor
    const query = `
      SELECT laporan.*, users.nama as user_nama 
      FROM laporan 
      LEFT JOIN users ON laporan.user_id = users.id 
      WHERE laporan.id = ?
    `;

    const [rows] = await connection.query(query, [id]);

    // Jika data tidak ditemukan
    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Laporan tidak ditemukan" }, 
        { status: 404 }
      );
    }

    const dataRaw = rows[0];

    // Langkah 3: Format data agar sesuai dengan yang diminta Frontend
    // Frontend kamu membaca: laporan.user.nama
    const formattedData = {
      ...dataRaw,
      user: {
        nama: dataRaw.user_nama || "Anonim" // Fallback jika user dihapus/null
      }
    };

    // Kirim response dalam format { data: ... }
    return NextResponse.json({ data: formattedData }, { status: 200 });

  } catch (error) {
    console.error("Database Error (GET):", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message }, 
      { status: 500 }
    );
  } finally {
    // Langkah 4: Wajib tutup koneksi agar server tidak overload (PENTING di Vercel)
    if (connection) {
      await connection.end();
    }
  }
}

// 2. PUT: Untuk update status (Sedang Diproses / Selesai)
export async function PUT(request, { params }) {
  let connection;

  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { message: "Status harus diisi" }, 
        { status: 400 }
      );
    }

    // Buka koneksi lagi untuk request ini
    connection = await connectDB();

    // Jalankan Query Update
    const query = "UPDATE laporan SET status = ? WHERE id = ?";
    await connection.query(query, [status, id]);

    return NextResponse.json(
      { message: "Status berhasil diupdate" }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Database Error (PUT):", error);
    return NextResponse.json(
      { message: "Gagal update status", error: error.message }, 
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}