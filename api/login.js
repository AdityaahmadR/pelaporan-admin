// api/login.js

import connectDB from '../admin-api/db.js';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password harus diisi.' });
  }

  const db = await connectDB();

  try {
    // 1. Cari pengguna berdasarkan email di database MySQL
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(query, [email]);

    // Jika pengguna tidak ditemukan
    if (rows.length === 0) {
      await db.end();
      return res.status(404).json({ message: 'Email atau password salah.' });
    }

    const user = rows[0];

    // 2. Bandingkan password yang dikirim dengan hash yang ada di database
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    // Jika password tidak cocok
    if (!isPasswordMatch) {
      await db.end();
      return res.status(401).json({ message: 'Email atau password salah.' });
    }
    
    // Tutup koneksi database
    await db.end();

    // 3. Kirim respons sukses dengan data pengguna (tanpa password)
    const { password: _, ...userData } = user; // Hapus password dari objek user
    res.status(200).json({ success: true, message: 'Login berhasil!', user: userData });

  } catch (error) {
    console.error('❌ Terjadi error saat login:', error);
    if (db) await db.end();
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.', error: error.message });
  }
}