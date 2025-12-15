// File: src/app/api/riwayat/route.js

import connectDB from "@/lib/db";
import { NextResponse } from "next/server";

// Memastikan API selalu mengambil data terbaru dari serverexport const dynamic = 'force-dynamic';

/**
 * Mengambil riwayat laporan untuk satu pengguna tertentu.
 * Wajib menggunakan parameter userID.
 * Contoh: /api/riwayat?userID=123
 */
export async function GET(request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const userID = searchParams.get('userID');

    // Validasi: Jika userID tidak ada, kirim error
    if (!userID) {
      return new Response(JSON.stringify({ message: "Parameter userID wajib diisi." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    connection = await connectDB();

    // Query untuk mengambil semua laporan milik satu user, diurutkan dari yang terbaru
    const query = "SELECT * FROM laporan WHERE userID = ? ORDER BY tanggal DESC";
    const [rows] = await connection.query(query, [userID]);

    // Kirim data laporan sebagai respons
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      }
    });

  } catch (error) {
    console.error("❌ Error GET /api/riwayat:", error);
    return new Response(JSON.stringify({
      error: error.message,
      message: "Gagal mengambil data riwayat dari database."
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    if (connection) await connection.end();
  }
}