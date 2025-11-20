import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306
});

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

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}