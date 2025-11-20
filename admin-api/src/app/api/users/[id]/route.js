// src/app/api/pengguna/[id]/route.js  ← NAMA FOLDER [id] & FILE route.js SUDAH BENAR!

import mysql from 'mysql2/promise';

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

export async function DELETE(request, { params }) {
  const id = params.id;  // INI YANG BENAR! JANGAN PAKAI params.userId

  if (!id || isNaN(id)) {
    return new Response(JSON.stringify({ error: 'ID user tidak valid' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const [result] = await pool.execute('DELETE FROM users WHERE userID = ?', [id]);

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
    console.error('Error hapus user:', error);
    return new Response(JSON.stringify({ 
      error: 'Gagal menghapus dari database',
      details: error.message 
    }), { status: 500 });
  }
}