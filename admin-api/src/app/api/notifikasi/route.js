// src/app/api/notifikasi/route.js

// PERBAIKAN UTAMA: Impor 'admin' dari file helper yang sudah kita buat, bukan dari library-nya langsung.
import { admin } from '@/lib/firebase-admin';

// Beritahu Vercel untuk tidak melakukan build statis pada route ini.
export const dynamic = 'force-dynamic';

/**
 * Fungsi ini akan dieksekusi ketika ada request POST ke /api/notifikasi
 * (atau nama baru yang Anda gunakan).
 */
export async function POST(request) {
  try {
    const laporanBaru = await request.json();
    const { deskripsi, lokasi, prioritas } = laporanBaru;

    if (!deskripsi || !lokasi || !prioritas) {
      // Menggunakan new Response() agar konsisten dengan file lain yang sudah berhasil.
      return new Response(
        JSON.stringify({ success: false, message: 'Data laporan tidak lengkap.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Periksa apakah prioritasnya adalah 'darurat'
    if (prioritas.toLowerCase() === 'darurat') {
      const topic = 'laporan_darurat';
      const message = {
        data: {
          title: 'Laporan Darurat!',
          body: deskripsi,
          googleMapsLink: lokasi,
        },
        topic: topic,
        android: {
          priority: 'high',
        },
      };

      // Baris ini sekarang akan berfungsi karena 'admin' sudah diimpor dengan benar.
      const response = await admin.messaging().send(message);
      console.log('Pesan darurat berhasil dikirim:', response);
    }

    // Kirim respons sukses.
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Proses notifikasi selesai.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error saat mengirim notifikasi:', error);
    // Kirim respons error.
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Terjadi kesalahan internal pada server.',
        error: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}