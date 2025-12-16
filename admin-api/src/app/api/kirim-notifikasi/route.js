// File: src/app/api/kirim-notifikasi/route.js (PERBAIKAN FINAL - UNTUK MENGIRIM)
import { admin } from '@/lib/firebase-admin';
import connectDB from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { userID, title, body, type, contentID } = await request.json();

  if (!userID || !title || !body) {
    return new Response(JSON.stringify({ message: "Data tidak lengkap" }), { status: 400 });
  }

  let connection;
  try {
    connection = await connectDB();

    const query = "INSERT INTO notifikasi (penerimaID, isiPesan) VALUES (?, ?)";
    const isiPesan = `${title}: ${body}`; // Gabungkan judul dan isi

    await connection.execute(query, [userID, isiPesan]);

    // Cek apakah Firebase Admin SDK sudah diinisialisasi
    if (!admin || !admin.messaging) {
      console.warn('Firebase Admin SDK tidak diinisialisasi - notifikasi FCM dilewati');
      return new Response(JSON.stringify({
        success: true,
        warning: 'Notifikasi disimpan ke database tapi FCM tidak dikirim (Firebase credentials belum dikonfigurasi)'
      }), { status: 200 });
    }

    const fcmData = {
      title: String(title),
      body: String(body),
      type: String(type || 'default'),
      contentID: String(contentID || '')
    };

    const topic = `user_${userID}`;
    const message = {
      data: fcmData,
      topic: topic,
    };

    await admin.messaging().send(message);

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}