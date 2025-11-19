import { NextResponse } from 'next/server';
import connectDB from '../../../../db'; // Path disesuaikan agar keluar dari src/app/api
import bcrypt from 'bcrypt';
import admin from 'firebase-admin';// --- Inisialisasi Firebase Admin ---
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

export async function POST(request) {
  const { nama, email, password } = await request.json();

  if (!nama || !email || !password) {
    return NextResponse.json({ message: 'Nama, email, dan password harus diisi.' }, { status: 400 });
  }

  const db = await connectDB();
  let firebaseUser = null;

  try {
    firebaseUser = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: nama,
    });
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = 'INSERT INTO users (uid, nama, email, password) VALUES (?, ?, ?, ?)';
    const values = [firebaseUser.uid, nama, email, hashedPassword];
    await db.execute(query, values);
    
    await db.end();

    return NextResponse.json({ success: true, message: 'Registrasi berhasil!', uid: firebaseUser.uid }, { status: 201 });

  } catch (error) {
    console.error('❌ Terjadi error saat registrasi:', error);
    if (firebaseUser) {
      await admin.auth().deleteUser(firebaseUser.uid);
    }
    if (db) await db.end();

    let errorMessage = 'Gagal melakukan registrasi.';
    if (error.code === 'auth/email-already-exists') {
        errorMessage = 'Email yang Anda masukkan sudah terdaftar.';
    } else if (error.sqlMessage) {
        errorMessage = 'Terjadi kesalahan pada database.';
    }

    return NextResponse.json({ success: false, message: errorMessage, error: error.message }, { status: 500 });
  }
}