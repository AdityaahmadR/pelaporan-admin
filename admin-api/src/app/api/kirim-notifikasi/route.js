// File: src/app/api/kirim-notifikasi/route.js (PERBAIKAN FINAL)

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
    
    // --- PERBAIKAN 1: Menyesuaikan dengan struktur tabel 'notifikasi' ---
    const query = "INSERT INTO notifikasi (penerimaID, isiPesan) VALUES (?, ?)";
    const isiPesan = `${title}: ${body}`;
    await connection.execute(query, [userID, isiPesan]);

    // --- PERBAIKAN 2: Memastikan semua nilai data FCM adalah string ---
    const fcmData = {
      title: String(title),
      body: String(body),
      type: String(type || 'default'),
      contentID: String(contentID || '') // Mengubah null/undefined menjadi string kosong
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
    // Memberikan pesan error yang lebih spesifik
    const errorMessage = error.code === 'messaging/invalid-argument' 
      ? "FCM Error: " + error.message 
      : "Database or server error: " + error.message;

    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}