// src/app/api/laporan/ambilLaporan/route.js
import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT) || 39744,
  ssl: { rejectUnauthorized: false },
  connectionLimit: 10,
});

export async function GET() {
  // JANGAN PAKAI { params } karena ini bukan [id]
  try {
    const [rows] = await pool.query(`
      SELECT 
        l.laporanID,
        l.isi_laporan,
        l.tanggal,
        l.lokasi,
        u.nama AS nama_pelapor
      FROM laporan l
      JOIN users u ON l.userID = u.userID
      ORDER BY l.tanggal DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error ambil laporan:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}