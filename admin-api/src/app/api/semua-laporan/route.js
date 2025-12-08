// app/api/semua-laporan/route.js (Versi Perbaikan Final)

import { NextResponse } from "next/server";
import connectDB from "@/lib/db"; // Pastikan path ini sesuai

// Memastikan API selalu dijalankan di server dan tidak di-cache
export const dynamic = 'force-dynamic';

// --- FUNGSI GET (MENGAMBIL DATA LAPORAN) ---
export async function GET(request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const prioritas = searchParams.get('prioritas');
    // --- PERBAIKAN: Mengambil userID dari parameter URL ---
    const userID = searchParams.get('userID');

    connection = await connectDB();

    let query = `SELECT 
      l.*, 
      u.nama AS nama_pelapor, 
      u.email AS email_pelapor
      FROM laporan l
      JOIN users u ON l.userID = u.userID`;

    const values = [];
    const conditions = [];

    // --- PERBAIKAN: Membangun query dinamis ---
    if (prioritas) {
      conditions.push("l.prioritas = ?");
      values.push(prioritas);
    }
    if (userID) {
      conditions.push("l.userID = ?");
      values.push(userID);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY l.tanggal DESC";

    const [rows] = await connection.query(query, values);

    // Menggunakan new Response untuk konsistensi
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      }
    });

  } catch (error) {
    console.error("❌ Error GET /api/semua-laporan:", error);
    return new Response(JSON.stringify({
      error: error.message,
      message: "Gagal mengambil data laporan dari database."
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    if (connection) await connection.end();
  }
}

// --- FUNGSI POST (MEMBUAT LAPORAN BARU) ---
export async function POST(request) {
  const { userID, deskripsi, lokasi } = await request.json();

  if (!userID || !deskripsi) {
    return new Response(JSON.stringify({ message: "User ID dan deskripsi wajib diisi" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  let connection;
  try {
    connection = await connectDB();

    const query = "INSERT INTO laporan (userID, deskripsi, lokasi, prioritas, status) VALUES (?, ?, ?, 'sedang', 'baru')";
    const lokasiLaporan = lokasi || null;

    await connection.execute(query, [userID, deskripsi, lokasiLaporan]);

    return new Response(JSON.stringify({ success: true, message: "Laporan berhasil dikirim" }), { status: 201, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("❌ Error POST /api/laporan:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  } finally {
    if (connection) await connection.end();
  }
}