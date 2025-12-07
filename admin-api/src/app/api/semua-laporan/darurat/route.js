// src/app/api/laporan/darurat/route.js (Versi Perbaikan)

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

export async function POST(req) {
  const { userID, deskripsi, lokasi } = await req.json();

  if (!userID) {
    return new Response(
      JSON.stringify({ message: 'Error: Field userID wajib diisi.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let connection;
  try {
    connection = await connectDB();
    
    const query = 'INSERT INTO laporan (userID, prioritas, deskripsi, status, lokasi) VALUES (?, ?, ?, ?, ?)';
    
    const deskripsiLaporan = deskripsi || 'Laporan darurat dari tombol panik.';
    const statusLaporan = 'baru';
    const prioritasLaporan = 'darurat';
    // --- PERBAIKAN: Jika lokasi tidak ada, gunakan NULL ---
    const lokasiLaporan = lokasi || null;
    
    await connection.execute(query, [userID, prioritasLaporan, deskripsiLaporan, statusLaporan, lokasiLaporan]);
    
    await connection.end();
    
    return new Response(
      JSON.stringify({ success: true, message: 'Laporan darurat berhasil disimpan!' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Terjadi error saat menyimpan laporan darurat:', error);
    if (connection) await connection.end();
    
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal menyimpan laporan ke database.', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}