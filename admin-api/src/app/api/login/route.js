import { NextResponse } from 'next/server';
import connectDB from '../../../../db'; // Path disesuaikan agar keluar dari src/app/api
import bcrypt from 'bcrypt';

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email dan password harus diisi.' }, { status: 400 });
  }

  const db = await connectDB();

  try {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(query, [email]);

    if (rows.length === 0) {
      await db.end();
      return NextResponse.json({ message: 'Email atau password salah.' }, { status: 404 });
    }

    const user = rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      await db.end();
      return NextResponse.json({ message: 'Email atau password salah.' }, { status: 401 });
    }
    
    await db.end();

    const { password: _, ...userData } = user;
    return NextResponse.json({ success: true, message: 'Login berhasil!', user: userData }, { status: 200 });

  } catch (error) {
    console.error('❌ Terjadi error saat login:', error);
    if (db) await db.end();
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada server.', error: error.message }, { status: 500 });
  }
}