// src/app/api/laporan/darurat/route.js
import connectDB from "@/lib/db";
// PERBAIKAN #1: Impor 'admin' dari file helper firebase-admin
import { admin } from '@/lib/firebase-admin';

// Beritahu Vercel untuk tidak membangun (build) route ini secara statis.
export const dynamic = 'force-dynamic';

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
    
    // --- LANGKAH 1: SIMPAN LAPORAN KE DATABASE ---
    const query = 'INSERT INTO laporan (userID, prioritas, deskripsi, status, lokasi) VALUES (?, ?, ?, ?, ?)';
    
    const deskripsiLaporan = deskripsi || 'Laporan darurat dari tombol panik.';
    const statusLaporan = 'baru';
    const prioritasLaporan = 'darurat';
    const lokasiLaporan = lokasi || null;
    
    await connection.execute(query, [userID, prioritasLaporan, deskripsiLaporan, statusLaporan, lokasiLaporan]);
    
    console.log('Laporan darurat berhasil disimpan ke database.');

    // --- LANGKAH 2: KIRIM NOTIFIKASI FIREBASE ---
    const topic = 'laporan_darurat';
    const message = {
      data: {
        title: 'Laporan Darurat!',
        body: deskripsiLaporan,
        googleMapsLink: lokasiLaporan,
      },
      topic: topic,
      android: {
        priority: 'high',
      },
    };

    // Mengirim pesan menggunakan instance 'admin' yang sudah diimpor dengan benar
    const response = await admin.messaging().send(message);
    console.log('Pesan darurat berhasil dikirim ke Firebase:', response);

    // --- LANGKAH 3: KIRIM RESPONS SUKSES ---
    return new Response(
      JSON.stringify({ success: true, message: 'Laporan darurat berhasil disimpan dan notifikasi terkirim!' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Terjadi error saat proses laporan darurat:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal memproses laporan.', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    if (connection) await connection.end();
  }
}