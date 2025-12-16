// File: src/app/api/kirim-notifikasi/route.js
import { admin } from '@/lib/firebase-admin';
import connectDB from "@/lib/db";
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let connection;
  
  try {
    const { userID, title, body, type, contentID } = await request.json();

    // 1. Validasi Input
    if (!userID || !title || !body) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    console.log(`📩 Menerima request notifikasi untuk: ${userID}`);

    // 2. Simpan ke Database MySQL (Opsional: Jika gagal DB, tetap coba kirim notif)
    try {
      connection = await connectDB();
      const query = "INSERT INTO notifikasi (penerimaID, isiPesan, tanggal) VALUES (?, ?, NOW())";
      const isiPesan = `${title}: ${body}`; 
      
      // Menggunakan connection.execute atau connection.query tergantung library mysql2
      await connection.execute(query, [userID, isiPesan]);
      console.log("✅ Disimpan ke Database MySQL");
    } catch (dbError) {
      console.error("⚠️ Gagal simpan ke DB, lanjut kirim FCM:", dbError.message);
      // Kita tidak return error disini agar notifikasi tetap terkirim ke HP
    }

    // 3. Cek Ketersediaan Firebase Admin
    // Pastikan admin terdefinisi DAN ada apps yang jalan
    if (!admin || admin.apps.length === 0) {
      console.error('❌ Firebase Admin SDK belum siap.');
      return NextResponse.json({ 
        success: false, 
        error: 'Firebase Admin belum dikonfigurasi di server.' 
      }, { status: 500 });
    }

    // 4. Tentukan Topic
    // PENTING: Jika userID adalah 'admin', kirim ke topic 'petugas' agar semua petugas dapat
    let topic = `user_${userID}`;
    if (userID === 'admin' || userID === 'petugas') {
        topic = 'petugas'; 
    }

    // 5. Susun Payload FCM
    const message = {
      topic: topic,
      
      // WAJIB ADA: Agar muncul popup notifikasi di Android/iOS
      notification: {
        title: String(title),
        body: String(body),
      },
      
      // Data tambahan untuk logika aplikasi saat diklik
      data: {
        type: String(type || 'info'),
        contentID: String(contentID || ''),
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      }
    };

    // 6. Kirim Pesan
    console.log(`🚀 Mengirim ke topic: ${topic}`);
    const response = await admin.messaging().send(message);
    
    console.log("✅ Berhasil kirim FCM:", response);
    return NextResponse.json({ success: true, fcmResponse: response });

  } catch (error) {
    console.error("❌ ERROR FATAL API NOTIFIKASI:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    // Tutup koneksi DB jika bukan pool (jika pool, jangan di-end)
    // if (connection && connection.end) await connection.end(); 
  }
}