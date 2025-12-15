// File: src/app/api/notifikasi/[userID]/route.js (PERBAIKAN FINAL)

import connectDB from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { userID } = params;
  let connection;
  try {
    connection = await connectDB();
    
    // --- PERBAIKAN: Menggunakan nama kolom 'penerimaID' dan 'waktuKirim' ---
    const query = "SELECT * FROM notifikasi WHERE penerimaID = ? ORDER BY waktuKirim DESC";
    const [rows] = await connection.query(query, [userID]);

    // Mengubah nama kolom agar sesuai dengan yang diharapkan aplikasi Android
    const formattedRows = rows.map(row => ({
      notifikasiID: row.notifID,
      userID: row.penerimaID,
      judul: 'Notifikasi', // Judul default karena tidak ada di DB
      isi: row.isiPesan,
      tanggal: row.waktuKirim,
      statusBaca: row.statusBaca,
      tipe: 'default', // Tipe default
      contentID: '' // Content ID default
    }));

    return new Response(JSON.stringify(formattedRows), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`❌ Error GET /api/notifikasi/${userID}:`, error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } finally {
    if (connection) await connection.end();
  }
}