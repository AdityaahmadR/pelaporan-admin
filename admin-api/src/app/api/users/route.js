// src/app/api/users/route.js
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

// --- FUNGSI GET (Yang sudah ada) ---
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

// --- FUNGSI POST (BARU: Tambah User) ---
export async function POST(request) {
  try {
    const body = await request.json();
    const { nama, email, password, role } = body;

    // Validasi input
    if (!nama || !email || !password) {
      return new Response(JSON.stringify({ message: "Data tidak lengkap" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Cek email duplikat
    const [existing] = await pool.query("SELECT userID FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return new Response(JSON.stringify({ message: "Email sudah terdaftar" }), { 
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Default role 'masyarakat' jika tidak ditentukan
    const userRole = role || 'masyarakat';

    // Insert user baru
    // Catatan: Password disimpan plain text sesuai permintaan fitur dasar.
    // Untuk production, sangat disarankan menggunakan hashing (bcrypt).
    const [result] = await pool.query(
      "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)",
      [nama, email, password, userRole]
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