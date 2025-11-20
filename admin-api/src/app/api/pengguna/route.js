// src/app/api/pengguna/route.js
import mysql from 'mysql2/promise';
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
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