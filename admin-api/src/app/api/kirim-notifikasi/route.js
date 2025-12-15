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
    
    // --- PERBAIKAN: Menyesuaikan dengan struktur tabel 'notifikasi' ---
    const query = "INSERT INTO notifikasi (penerimaID, isiPesan) VALUES (?, ?)";
    
    // Gabungkan judul dan isi ke dalam satu pesan
    const isiPesan = `${title}: ${body}`;
    
    await connection.execute(query, [userID, isiPesan]);

    // Kirim notifikasi push via FCM (tidak berubah)
    const topic = `user_${userID}`;
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