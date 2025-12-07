import { NextResponse } from 'next/server';
// Pastikan Anda mengimpor instance Firebase Admin yang sudah diinisialisasi.
// Path ini mungkin perlu disesuaikan dengan struktur proyek backend Anda,
// contoh: '../../lib/firebase-admin'
import { admin } from 'firebase-admin';

// Instruksi penting untuk Vercel agar tidak terjadi build timeout.
export const dynamic = 'force-dynamic';

/**
 * Fungsi ini akan dieksekusi ketika ada request POST ke /api/notifikasi
 * Diasumsikan ini dipicu setelah sebuah laporan baru berhasil disimpan ke database MySQL.
 */
export async function POST(request) {
  try {
    // 1. Ambil data laporan dari body request yang masuk.
    // Anda bisa menyesuaikan ini tergantung bagaimana Anda memicu route ini.
    const laporanBaru = await request.json();
    const { deskripsi, lokasi, prioritas } = laporanBaru;

    // Pastikan data yang dibutuhkan ada
    if (!deskripsi || !lokasi || !prioritas) {
      return NextResponse.json({ success: false, message: 'Data laporan tidak lengkap.' }, { status: 400 });
    }

    // --- LOGIKA UTAMA ANDA UNTUK MENGIRIM NOTIFIKASI ---

    // 2. Periksa apakah prioritasnya adalah 'darurat'
    if (prioritas.toLowerCase() === 'darurat') {
      const topic = 'laporan_darurat'; // Semua aplikasi petugas akan subscribe ke topik ini

      // 3. Buat payload (isi pesan) untuk notifikasi
      const message = {
        data: {
          // 'data' payload akan diterima aplikasi bahkan saat di background
          title: 'Laporan Darurat!',
          body: deskripsi,
          googleMapsLink: lokasi,
        },
        topic: topic,
        android: {
          // Atur prioritas 'high' agar notifikasi segera diproses
          priority: 'high',
        },
      };

      // 4. Kirim pesan notifikasi menggunakan Firebase Admin SDK
      const response = await admin.messaging().send(message);
      console.log('Pesan darurat berhasil dikirim:', response);
    }

    // --- AKHIR DARI LOGIKA UTAMA ---

    // 5. Kirim respons sukses bahwa proses telah selesai.
    return NextResponse.json({
        success: true,
        message: 'Proses notifikasi selesai (pesan darurat terkirim jika prioritasnya darurat).'
    }, { status: 200 });

  } catch (error) {
    // Tangani jika ada error selama proses
    console.error('Error saat mengirim notifikasi:', error);
    return NextResponse.json({
        success: false,
        message: 'Terjadi kesalahan internal pada server.',
        error: error.message
    }, { status: 500 });
  }
}