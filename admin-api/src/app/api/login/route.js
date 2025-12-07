import connectDB from '../../lib/db'; // Ganti ini jika path-nya berbeda
import bcrypt from 'bcryptjs';

// PERBAIKAN #1: Pastikan route ini tidak di-build secara statis
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    // PERBAIKAN #2: Gunakan new Response() untuk semua return
    return new Response(JSON.stringify({ message: 'Email dan password harus diisi.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let db;
  try {
    db = await connectDB();
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(query, [email]);

    if (rows.length === 0) {
      await db.end();
      return new Response(JSON.stringify({ message: 'Email atau password salah.' }), {
        status: 401, // Gunakan 401 untuk otentikasi gagal
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      await db.end();
      return new Response(JSON.stringify({ message: 'Email atau password salah.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await db.end();

    const { password: _, ...userData } = user;
    return new Response(JSON.stringify({ success: true, message: 'Login berhasil!', user: userData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Terjadi error saat login:', error);
    if (db) await db.end();
    return new Response(JSON.stringify({ success: false, message: 'Terjadi kesalahan pada server.', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}