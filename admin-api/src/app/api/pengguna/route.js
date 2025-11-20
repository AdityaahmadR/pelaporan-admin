// src/app/api/pengguna/route.js
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

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID user tidak valid' }, { status: 400 });
    }

    const [result] = await pool.execute(
      'DELETE FROM users WHERE userID = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: 'User berhasil dihapus!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error hapus user:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus dari database', details: error.message },
      { status: 500 }
    );
  }
}