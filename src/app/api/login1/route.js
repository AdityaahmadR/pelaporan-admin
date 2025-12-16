import { NextResponse } from "next/server";
import db from "@/lib/db"; // Menggunakan koneksi pool yang sudah kamu buat
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Validasi Input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // 2. Cari Admin di Database
    const query = "SELECT * FROM admin WHERE email = ?";
    const [rows] = await db.query(query, [email]);

    // Jika email tidak ditemukan
    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Email tidak ditemukan atau belum terdaftar" },
        { status: 401 }
      );
    }

    const admin = rows[0];

    // 3. Verifikasi Password (Bcrypt)
    // Bandingkan password input user dengan password hash di DB
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Password salah" },
        { status: 401 }
      );
    }

    // 4. Login Berhasil - Buat Token Sederhana
    // (Di production sebaiknya gunakan library 'jsonwebtoken' atau 'jose')
    const token = Buffer.from(`${admin.adminID}:${admin.email}:${Date.now()}`).toString('base64');

    return NextResponse.json(
      {
        message: "Login berhasil",
        token: token,
        user: {
          id: admin.adminID,
          nama: admin.nama,
          email: admin.email,
          role: admin.role
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server", error: error.message },
      { status: 500 }
    );
  }
}