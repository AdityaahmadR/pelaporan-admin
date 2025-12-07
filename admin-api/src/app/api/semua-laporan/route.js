// app/api/semua-laporan/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- FUNGSI GET (MENGAMBIL DATA LAPORAN) ---
export async function GET(request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const prioritas = searchParams.get('prioritas');
    
    connection = await connectDB();
    
    // PERBAIKAN SQL: Pastikan tidak ada spasi/newline berlebihan di awal query.
    let query = `SELECT 
      l.*, 
      u.nama AS nama_pelapor, 
      u.email AS email_pelapor
    FROM laporan l
    JOIN users u ON l.userID = u.userID`;
    
    const values = [];
    
    if (prioritas) {
      query += " WHERE l.prioritas = ?";
      values.push(prioritas);
    }
    
    query += " ORDER BY l.tanggal DESC";
    
    const [rows] = await connection.query(query, values);

    // Menggunakan NextResponse.json untuk respons yang benar
    return NextResponse.json(rows, { status: 200 });

  } catch (error) {
    console.error("❌ Error GET /api/semua-laporan:", error);
    
    // Menggunakan NextResponse.json untuk error
    return NextResponse.json({ 
      error: error.message,
      message: "Gagal mengambil data laporan dari database."
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// --- FUNGSI POST (MEMBUAT LAPORAN BARU) ---
export async function POST(request) {
  const { userID, deskripsi, lokasi } = await request.json();

  if (!userID || !deskripsi) {
    return NextResponse.json({ message: "User ID dan deskripsi wajib diisi" }, { status: 400 });
  }

  let connection;
  try {
    connection = await connectDB();
    
    const query = "INSERT INTO laporan (userID, deskripsi, lokasi, prioritas, status) VALUES (?, ?, ?, 'sedang', 'baru')";
    
    const lokasiLaporan = lokasi || null;
    
    await connection.execute(query, [userID, deskripsi, lokasiLaporan]);
    
    return NextResponse.json({ success: true, message: "Laporan berhasil dikirim" }, { status: 201 });

  } catch (error) {
    console.error("❌ Error POST /api/laporan:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}