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
  try {
    const [rows] = await pool.execute(`
      SELECT 
        l.laporanID,
        l.deskripsi,
        l.tanggal,
        l.lokasi,
        COALESCE(u.nama, 'Masyarakat') AS nama_pelapor
      FROM laporan l
      LEFT JOIN users u ON l.userID = u.userID
      ORDER BY l.tanggal DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error ambil semua laporan:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}