import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,        // trolley.proxy.rlwy.net
  user: process.env.MYSQLUSER,        // root
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE, // railway
  port: Number(process.env.MYSQLPORT), // 39744 → PASTI INI!
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000
});

export const fetchCache = 'force-no-store'; // tambah ini juga biar aman

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || 'masyarakat';

  try {
    const [rows] = await pool.query(`
      SELECT u.userID, u.nama, u.email, COUNT(l.laporanID) as jumlah_laporan
      FROM users u
      LEFT JOIN laporan l ON u.userID = l.userID
      WHERE u.role = ?
      GROUP BY u.userID
      ORDER BY u.created_at DESC
    `, [role]);

    return new NextResponse(JSON.stringify(rows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('DB Error:', error.message);
    return new NextResponse(JSON.stringify({ error: 'Gagal konek ke database' }), {
      status: 500,
      headers: { 'Cache-Control': 'no-store' }
    });
  }
}