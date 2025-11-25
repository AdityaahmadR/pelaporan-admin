// src/app/api/laporan/[id]/route.js
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

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const [rows] = await pool.execute(`
      SELECT 
        l.laporanID,
        l.deskripsi AS isi_laporan,
        l.tanggal,
        l.lokasi,
        COALESCE(u.nama, 'Masyarakat') AS nama_pelapor,
        COALESCE(u.email, '-') AS email
      FROM laporan l
      LEFT JOIN users u ON l.userID = u.userID
      WHERE l.laporanID = ?
    `, [id]);

    if (rows.length === 0) return new NextResponse('Not Found', { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error detail:', error);
    return new NextResponse('Error', { status: 500 });
  }
}