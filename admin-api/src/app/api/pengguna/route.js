// src/app/api/pengguna/route.js

import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Inisialisasi Firebase Admin (hanya sekali)
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
    });
    console.log('Firebase Admin SDK berhasil diinisialisasi');
  } catch (error) {
    console.error('Gagal inisialisasi Firebase Admin:', error.message);
  }
}

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

// --- FUNGSI GET (BARU & DISEMPURNAKAN) ---
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    // Query dasar untuk mengambil user dan menghitung laporannya
    let query = `
      SELECT
        u.*,
        COUNT(l.laporanID) AS jumlahLaporan
      FROM
        users u
      LEFT JOIN
        laporan l ON u.userID = l.userID
    `;

    const values = [];

    // Jika ada parameter 'role', tambahkan kondisi WHERE
    if (role) {
      query += ' WHERE u.role = ?';
      values.push(role);
    }

    // Kelompokkan hasil berdasarkan userID untuk memastikan COUNT berjalan benar
    query += ' GROUP BY u.userID ORDER BY u.nama ASC';

    const [rows] = await pool.query(query, values);

    return NextResponse.json(rows, { status: 200 });

  } catch (error) {
    console.error('Error GET /api/pengguna:', error);
    return NextResponse.json({
      error: 'Gagal mengambil data pengguna',
      details: error.message
    }, { status: 500 });
  }
}

// --- FUNGSI DELETE (Tetap sama, sudah benar) ---
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID user tidak valid' }, { status: 400 });
    }

    // 1. Ambil email sebelum dihapus dari MySQL
    const [userRows] = await pool.query('SELECT email FROM users WHERE userID = ?', [id]);

    if (userRows.length === 0) {
      return NextResponse.json({ error: 'User tidak ditemukan di database' }, { status: 404 });
    }

    const email = userRows[0].email;

    // 2. Hapus dari MySQL Railway
    await pool.execute('DELETE FROM users WHERE userID = ?', [id]);

    // 3. Hapus dari Firebase Authentication
    try {
      const userRecord = await getAuth().getUserByEmail(email);
      await getAuth().deleteUser(userRecord.uid);
      console.log(`Firebase user berhasil dihapus: ${email}`);
    } catch (firebaseError) {
      if (firebaseError.code !== 'auth/user-not-found') {
        console.warn('Firebase: user mungkin sudah dihapus sebelumnya atau error:', firebaseError.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus dari database & Firebase!'
    }, { status: 200 });

  } catch (error) {
    console.error('Error saat hapus user:', error);
    return NextResponse.json({
      error: 'Gagal menghapus user',
      details: error.message
    }, { status: 500 });
  }
}