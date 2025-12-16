// src/app/api/laporan/darurat/route.js
import connectDB from "@/lib/db";
// PERBAIKAN #1: Impor 'admin' dari file helper firebase-admin
import { admin } from '@/lib/firebase-admin';

// Beritahu Vercel untuk tidak membangun (build) route ini secara statis.
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    console.log('=== EMERGENCY REPORT API CALLED ===');
    const { userID, deskripsi, lokasi } = await req.json();
    console.log('Request body:', { userID, deskripsi, lokasi });

    if (!userID) {
      console.log('Missing userID, returning 400');
      return new Response(
        JSON.stringify({ message: 'Error: Field userID wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Environment variables check:');
    console.log('MYSQLHOST:', process.env.MYSQLHOST ? 'SET' : 'NOT SET');
    console.log('MYSQLUSER:', process.env.MYSQLUSER ? 'SET' : 'NOT SET');
    console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? 'SET' : 'NOT SET');
    console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE ? 'SET' : 'NOT SET');
    console.log('MYSQLPORT:', process.env.MYSQLPORT ? 'SET' : 'NOT SET');

    let connection;
    try {
      console.log('Attempting database connection...');
      connection = await connectDB();
      console.log('Database connected successfully');

      // --- LANGKAH 1: SIMPAN LAPORAN KE DATABASE ---
      const query = 'INSERT INTO laporan (userID, prioritas, deskripsi, status, lokasi) VALUES (?, ?, ?, ?, ?)';

      const deskripsiLaporan = deskripsi || 'Laporan darurat dari tombol panik.';
      const statusLaporan = 'baru';
      const prioritasLaporan = 'darurat';
      const lokasiLaporan = lokasi || null;

      console.log('Executing query:', query, [userID, prioritasLaporan, deskripsiLaporan, statusLaporan, lokasiLaporan]);

      await connection.execute(query, [userID, prioritasLaporan, deskripsiLaporan, statusLaporan, lokasiLaporan]);

      console.log('Laporan darurat berhasil disimpan ke database.');

      // --- LANGKAH 2: KIRIM NOTIFIKASI FIREBASE ---
      // Cek apakah Firebase Admin SDK sudah diinisialisasi
      if (!admin || !admin.messaging) {
        console.warn('Firebase Admin SDK tidak diinisialisasi - notifikasi FCM dilewati');
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Laporan darurat berhasil disimpan ke database!',
            warning: 'Notifikasi FCM tidak dikirim (Firebase credentials belum dikonfigurasi)'
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
      }

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

    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      return new Response(
        JSON.stringify({ success: false, message: 'Gagal menyimpan laporan ke database.', error: dbError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    } finally {
      if (connection) await connection.end();
    }

  } catch (error) {
    console.error('❌ General error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal memproses laporan.', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}