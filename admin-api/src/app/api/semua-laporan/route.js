// Versi paksa-update: 2025-12-07 - 18:20
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const prioritas = searchParams.get('prioritas');
    connection = await connectDB();
    let query = "SELECT * FROM laporan";
    const values = [];
    if (prioritas) {
      query += " WHERE prioritas = ?";
      values.push(prioritas);
    }
    query += " ORDER BY tanggal DESC";
    const [rows] = await connection.query(query, values);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("❌ Error GET /api/semua-laporan:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

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