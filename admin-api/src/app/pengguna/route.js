import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache'; // TAMBAH INI
import mysql from 'mysql2/promise';

export const dynamic = 'force-dynamic'; // TAMBAH INI

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function GET(request) {
  noStore(); // INI YANG BIKIN VERCEL TAKUT CACHING → LANGSUNG SKIP PRERENDER

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

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Gagal mengambil data dari database" }, { status: 500 });
  }
}