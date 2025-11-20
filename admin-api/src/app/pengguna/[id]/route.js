import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import mysql from 'mysql2/promise';

export const dynamic = 'force-dynamic';

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306
});

export async function DELETE(request, { params }) {
  noStore();
  const { id } = params;

  try {
    await pool.query('DELETE FROM users WHERE userID = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}