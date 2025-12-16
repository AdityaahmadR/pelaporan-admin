import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Import crypto untuk generate UID

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

// --- FUNGSI GET (Ambil Data User) ---
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'masyarakat';

    const [rows] = await pool.query(`
      SELECT 
        u.userID,
        u.nama,
        u.email,
        COALESCE(COUNT(l.laporanID), 0) AS jumlah_laporan
      FROM users u
      LEFT JOIN laporan l ON u.userID = l.userID
      WHERE u.role = ?
      GROUP BY u.userID
      ORDER BY u.created_at DESC
    `, [role]);

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('API Error /api/users:', error);
    return new Response(JSON.stringify({ 
      error: 'Gagal mengambil data dari database',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// --- FUNGSI POST (Tambah User Baru) ---
export async function POST(request) {
  try {
    const body = await request.json();
    const { nama, email, password, role } = body;

    // 1. Validasi Input
    if (!nama || !email || !password) {
      return new Response(JSON.stringify({ message: "Data tidak lengkap" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Cek apakah email sudah terdaftar
    const [existing] = await pool.query("SELECT userID FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return new Response(JSON.stringify({ message: "Email sudah terdaftar" }), { 
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. GENERATE UID (Agar tidak NULL)
    const uid = crypto.randomUUID();

    // 4. Tentukan Role
    const userRole = role || 'masyarakat';

    // 5. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Simpan ke Database (Sertakan UID)
    const [result] = await pool.query(
      "INSERT INTO users (uid, nama, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [uid, nama, email, hashedPassword, userRole]
    );

    return new Response(JSON.stringify({ 
      message: "User berhasil ditambahkan",
      userID: result.insertId 
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API POST Error /api/users:', error);
    return new Response(JSON.stringify({ 
      message: "Terjadi kesalahan server",
      details: error.message 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// --- FUNGSI DELETE (Hapus User) ---
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ message: "ID User diperlukan" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Eksekusi query delete
    const [result] = await pool.query("DELETE FROM users WHERE userID = ?", [id]);

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ message: "User tidak ditemukan" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ message: "User berhasil dihapus" }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API DELETE Error /api/users:', error);
    
    // Cek constraint (misal user punya laporan, biasanya tidak bisa dihapus langsung)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return new Response(JSON.stringify({ message: "Gagal: User ini memiliki data laporan terkait." }), { 
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      message: "Terjadi kesalahan server saat menghapus",
      details: error.message 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
}