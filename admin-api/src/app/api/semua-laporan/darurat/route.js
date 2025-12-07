// src/app/api/laporan/darurat/route.js

import connectDB from "@/lib/db";

// Tambahkan ini untuk memastikan rute selalu dinamis (tidak di-cache)
export const dynamic = 'force-dynamic';
export const revalidate = 0; 

export async function POST(req) {
  
  let body;
  try {
    // Pastikan request.json() berhasil diekstrak
    body = await req.json();
  } catch (e) {
    return new Response(
      JSON.stringify({ message: 'Error: Request body harus berupa JSON yang valid.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { userID, deskripsi, lokasi } = body;

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
    const lokasiLaporan = lokasi || null;
    
    await connection.execute(query, [userID, prioritasLaporan, deskripsiLaporan, statusLaporan, lokasiLaporan]);
    
    // Tidak perlu connection.end() di sini, cukup di finally
    
    return new Response(
      JSON.stringify({ success: true, message: 'Laporan darurat berhasil disimpan!' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Terjadi error saat menyimpan laporan darurat:', error);
    // Hapus baris 'if (connection) await connection.end();' di sini
    // karena sudah ditangani di finally.
    
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal menyimpan laporan ke database.', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    // Pastikan connection.end() hanya ada di sini.
    if (connection) await connection.end();
  }
}