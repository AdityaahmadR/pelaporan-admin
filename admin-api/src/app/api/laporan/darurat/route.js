// src/app/api/laporan/darurat/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db"; // Menggunakan alias path dari jsconfig.json

/**
 * Membuat laporan darurat dengan prioritas 'darurat'.
 */
export async function POST(req) {
  
  // Mengambil semua data yang dikirim dari aplikasi
  const { userID, deskripsi, lokasi } = await req.json();

  // Validasi sederhana, hanya butuh userID
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
    const prioritasLaporan = 'darurat'; // Prioritas dipaksa di server
    
    // Menjalankan query dengan semua data
    await connection.execute(query, [userID, prioritasLaporan, deskripsiLaporan, statusLaporan, lokasi]);
    
    await connection.end();
    
    // Mengirim respons sukses
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