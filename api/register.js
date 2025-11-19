// api/register.js

import connectDB from '../admin-api/db.js'; // Mengimpor fungsi koneksi database
import bcrypt from 'bcrypt'; // Untuk hashing password
import admin from 'firebase-admin'; // Firebase Admin SDK

// --- Inisialisasi Firebase Admin ---
// Secara otomatis membaca variabel FIREBASE_SERVICE_ACCOUNT_JSON dari Vercel
try {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.error('Firebase Admin Initialization Error:', error.message);
}
// ------------------------------------

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { nama, email, password } = req.body;

  // Validasi input dasar
  if (!nama || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password harus diisi.' });
  }

  const db = await connectDB();
  let firebaseUser = null;

  try {
    // 1. Buat pengguna di Firebase Authentication
    firebaseUser = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: nama,
    });
    
    // 2. Hash password sebelum disimpan ke MySQL
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Simpan data pengguna ke database MySQL Railway
    const query = 'INSERT INTO users (uid, nama, email, password) VALUES (?, ?, ?, ?)';
    const values = [firebaseUser.uid, nama, email, hashedPassword];
    await db.execute(query, values);
    
    // Tutup koneksi database
    await db.end();

    // 4. Kirim respons sukses
    res.status(201).json({ success: true, message: 'Registrasi berhasil!', uid: firebaseUser.uid });

  } catch (error) {
    console.error('❌ Terjadi error saat registrasi:', error);

    // Jika user sudah terlanjur dibuat di Firebase tapi gagal simpan ke MySQL,
    // hapus user Firebase tersebut agar tidak ada data yatim (rollback).
    if (firebaseUser) {
      await admin.auth().deleteUser(firebaseUser.uid);
    }

    // Tutup koneksi database jika masih terbuka
    if (db) await db.end();

    let errorMessage = 'Gagal melakukan registrasi.';
    if (error.code === 'auth/email-already-exists') {
        errorMessage = 'Email yang Anda masukkan sudah terdaftar.';
    } else if (error.sqlMessage) {
        errorMessage = 'Terjadi kesalahan pada database.';
    }

    res.status(500).json({ success: false, message: errorMessage, error: error.message });
  }
}
