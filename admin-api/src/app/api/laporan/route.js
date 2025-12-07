import { NextResponse } from "next/server";
import connectDB from "@/lib/db"; // Pastikan path ini sesuai dengan struktur folder Anda

// GET laporan (Dengan Filter Prioritas)
export async function GET(request) {
  let connection;
  try {
    // 1. Ambil parameter dari URL (contoh: ?prioritas=darurat)
    const { searchParams } = new URL(request.url);
    const prioritas = searchParams.get('prioritas'); // isinya bisa 'sedang' atau 'darurat'

    connection = await connectDB();

    let query = "SELECT * FROM laporan";
    const values = [];

    // 2. Jika ada request filter prioritas, tambahkan WHERE clause
    if (prioritas) {
      query += " WHERE prioritas = ?";
      values.push(prioritas);
    }

    // 3. Urutkan dari yang terbaru
    query += " ORDER BY tanggal DESC";

    const [rows] = await connection.query(query, values);

    return NextResponse.json(rows, { status: 200 });

  } catch (error) {
    console.error("❌ Error GET laporan:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// POST laporan (Tetap sama)
export async function POST(request) {
  const { userID, deskripsi } = await request.json();

  if (!userID || !deskripsi) {
    return NextResponse.json({ message: "User ID dan deskripsi wajib diisi" }, { status: 400 });
  }

  let connection;
  try {
    connection = await connectDB();
    // Default prioritas 'sedang' jika tidak dikirim
    await connection.execute("INSERT INTO laporan (userID, deskripsi, prioritas) VALUES (?, ?, 'sedang')", [userID, deskripsi]);
    
    return NextResponse.json({ success: true, message: "Laporan berhasil dikirim" }, { status: 201 });

  } catch (error) {
    console.error("❌ Error POST laporan:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}