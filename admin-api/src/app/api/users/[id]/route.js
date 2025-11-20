// src/app/api/pengguna/[id]/route.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT) || 39744,
  ssl: { rejectUnauthorized: false },
  connectionLimit: 10
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    const [result] = await pool.query('DELETE FROM users WHERE userID = ?', [id]);
    
    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'User tidak ditemukan' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, message: 'User berhasil dihapus' }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error hapus user:', error);
    return new Response(JSON.stringify({ error: 'Gagal menghapus user' }), { status: 500 });
  }
}