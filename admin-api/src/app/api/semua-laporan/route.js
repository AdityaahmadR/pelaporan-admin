// src/app/api/semua-laporan/route.js
import connectDB from "@/lib/db";
// PERBAIKAN #1: Impor 'admin' dari file helper agar bisa kirim notifikasi
import { admin } from '@/lib/firebase-admin';

// Mencegah Vercel melakukan build statis.
export const dynamic = 'force-dynamic';

// --- FUNGSI GET (Tetap sama, sudah benar) ---
export async function GET(request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const prioritas = searchParams.get('prioritas');
    const userID = searchParams.get('userID');

    connection = await connectDB();

    let query = `SELECT 
      l.*, 
      u.nama AS nama_pelapor, 
      u.email AS email_pelapor
      FROM laporan l
      JOIN users u ON l.userID = u.userID`;

    const values = [];
    const conditions = [];

    if (prioritas) {
      conditions.push("l.prioritas = ?");
      values.push(prioritas);
    }
    if (userID) {
      conditions.push("l.userID = ?");
      values.push(userID);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY l.tanggal DESC";

    const [rows] = await connection.query(query, values);

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      }
    });

  } catch (error) {
    console.error("❌ Error GET /api/semua-laporan:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  } finally {
    if (connection) await connection.end();
  }
}

// --- FUNGSI POST (MEMBUAT LAPORAN MANUAL & KIRIM NOTIFIKASI) ---
export async function POST(request) {
  const { userID, deskripsi, lokasi } = await request.json();

  if (!userID || !deskripsi) {
    return new Response(JSON.stringify({ message: "User ID dan deskripsi wajib diisi" }), { status: 400, headers: { 'Content-Type': 'application/json' }});
  }

  let connection;
  try {
    connection = await connectDB();
    
    // LANGKAH 1: SIMPAN LAPORAN KE DATABASE
    const prioritasLaporan = 'sedang'; // Laporan manual memiliki prioritas 'sedang'
    const statusLaporan = 'baru';
    const lokasiLaporan = lokasi || null;
    const query = "INSERT INTO laporan (userID, deskripsi, lokasi, prioritas, status) VALUES (?, ?, ?, ?, ?)";
    await connection.execute(query, [userID, deskripsi, lokasiLaporan, prioritasLaporan, statusLaporan]);
    
    console.log('Laporan manual berhasil disimpan ke database.');

    // PERBAIKAN #2: KIRIM NOTIFIKASI MANUAL SETELAH LAPORAN DISIMPAN
    const topic = 'laporan_darurat'; 
    const message = {
      data: {
        title: 'Laporan Baru Diterima!',
        body: deskripsi,
        googleMapsLink: lokasiLaporan,
        notificationType: 'manual' // <- INI YANG AKAN MEMICU LAYAR KUNING
      },
      topic: topic,
      android: {
        priority: 'high',
      },
    };
    const response = await admin.messaging().send(message);
    console.log(`Pesan tipe 'manual' berhasil dikirim:`, response);
    
    // LANGKAH 3: KIRIM RESPONS SUKSES
    return new Response(JSON.stringify({ success: true, message: "Laporan berhasil dikirim dan notifikasi terkirim" }), { status: 201, headers: { 'Content-Type': 'application/json' }});

  } catch (error) {
    console.error("❌ Error POST /api/semua-laporan:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  } finally {
    if (connection) await connection.end();
  }
}