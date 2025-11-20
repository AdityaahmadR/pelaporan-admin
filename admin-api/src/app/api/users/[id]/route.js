// src/app/api/pengguna/[id]/route.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT) || 39744,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
  ssl: { rejectUnauthorized: false }
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(request, { params }) {
  const userId = params.id;

  if (!userId) {
    return new Response(JSON.stringify({ error: 'ID user diperlukan' }), { status: 400 });
  }

  try {
    const [result] = await pool.execute('DELETE FROM users WHERE userID = ?', [userId]);

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'User tidak ditemukan' }), { status: 404 });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'User berhasil dihapus!' 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('DELETE USER ERROR:', error);
    return new Response(JSON.stringify({ 
      error: 'Gagal menghapus dari database',
      details: error.message 
    }), { status: 500 });
  }
}