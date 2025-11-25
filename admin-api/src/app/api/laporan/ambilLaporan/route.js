// src/app/api/laporan/route.js
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
  connectTimeout: 30000
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        l.laporanID,
        l.deskripsi AS isi_laporan,
        l.tanggal,
        l.status,
        l.prioritas,
        COALESCE(u.nama, 'Masyarakat') AS nama_pelapor
      FROM laporan l
      LEFT JOIN users u ON l.userID = u.userID
      WHERE TRIM(l.status) = 'baru'
      ORDER BY l.tanggal DESC
    `);

    console.log(`Berhasil ambil ${rows.length} laporan baru`);
    return NextResponse.json(rows);

  } catch (error) {
    console.error('Error ambil laporan:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil laporan', details: error.message },
      { status: 500 }
    );
  }
}