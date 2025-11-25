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
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const [rows] = await pool.execute(
      `SELECT 
         l.laporanID,
         l.isi_laporan,
         l.tanggal,
         l.lokasi,
         u.nama AS nama_pelapor,
         u.email
       FROM laporan l
       JOIN users u ON l.userID = u.userID
       WHERE l.laporanID = ?`,
      [id]
    );

    if (rows.length === 0) {
      return new NextResponse(JSON.stringify({ message: 'Laporan tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return new NextResponse(JSON.stringify({ message: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}