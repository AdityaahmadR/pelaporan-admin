// src/app/api/notifikasi/route.js
import { admin } from '@/lib/firebase-admin';

// Beritahu Vercel untuk tidak melakukan build statis pada route ini.
export const dynamic = 'force-dynamic';

/**
 * Fungsi ini akan dieksekusi ketika ada request POST ke /api/notifikasi
 */
export async function POST(request) {
  try {
    const laporanBaru = await request.json();
    const { deskripsi, lokasi, prioritas } = laporanBaru;

    if (!deskripsi || !lokasi || !prioritas) {
      return new Response(
        JSON.stringify({ success: false, message: 'Data laporan tidak lengkap.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let notificationType = null;
    let title = "";

    // --- LOGIKA BARU: TENTUKAN TIPE NOTIFIKASI ---
    const prioritasLower = prioritas.toLowerCase();
    
    if (prioritasLower === 'darurat') {
      notificationType = 'darurat'; // Akan membuka layar merah
      title = 'Laporan Darurat!';
    } else if (prioritasLower === 'sedang') {
      notificationType = 'manual'; // Akan membuka layar kuning
      title = 'Laporan Baru Diterima!';
    }
    
    // Jika ada tipe notifikasi yang perlu dikirim
    if (notificationType) {
      const topic = 'laporan_darurat'; // Semua petugas subscribe ke topik ini
      
      const message = {
        data: {
          // Kirim data yang diperlukan oleh aplikasi
          title: title,
          body: deskripsi,
          googleMapsLink: lokasi,
          notificationType: notificationType, // DATA PENTING UNTUK ANDROID
        },
        topic: topic,
        android: {
          priority: 'high',
        },
      };

      // Kirim pesan notifikasi
      const response = await admin.messaging().send(message);
      console.log(`Pesan tipe '${notificationType}' berhasil dikirim:`, response);
    } else {
      console.log(`Prioritas '${prioritas}' tidak memerlukan notifikasi.`);
    }

    // Kirim respons sukses
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Proses notifikasi selesai.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error saat mengirim notifikasi:', error);
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