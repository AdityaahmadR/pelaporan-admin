// File: src/app/api/notifikasi/route.js (PERBAIKAN FINAL - UNTUK MENGAMBIL RIWAYAT)
import connectDB from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const userID = searchParams.get('userID');

    if (!userID) {
      return new Response(JSON.stringify({ message: "Parameter userID wajib diisi." }), { status: 400 });
    }

    connection = await connectDB();

    const query = "SELECT * FROM notifikasi WHERE penerimaID = ? ORDER BY waktuKirim DESC";
    const [rows] = await connection.query(query, [userID]);

    const formattedRows = rows.map(row => ({
      judul: 'Notifikasi',
      isi: row.isiPesan,
      tanggal: row.waktuKirim,
      tipe: 'default',
      contentID: ''
    }));

    return new Response(JSON.stringify(formattedRows), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });

  } catch (error) {
    console.error("❌ Error GET /api/notifikasi:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}