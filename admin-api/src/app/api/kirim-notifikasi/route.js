// File: src/app/api/kirim-notifikasi/route.js
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
    // Simpan notifikasi ke database
    const query = "INSERT INTO notifikasi (userID, judul, isi, tipe, contentID) VALUES (?, ?, ?, ?, ?)";
    await connection.execute(query, [userID, title, body, type || 'default', contentID || null]);

    // Kirim notifikasi push via FCM
    const topic = `user_${userID}`; // Topik personal untuk setiap user
    const message = {
      data: { title, body, type, contentID },
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