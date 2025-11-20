import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT), // 39744
  connectTimeout: 30000
});

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    await pool.query('DELETE FROM users WHERE userID = ?', [id]);
    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Cache-Control': 'no-store' }
    });
  }
}