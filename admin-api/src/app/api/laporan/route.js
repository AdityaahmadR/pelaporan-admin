import { NextResponse } from 'next/server';

// Instruksi ini memberitahu Vercel untuk tidak melakukan build statis
export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Fungsi ini TIDAK terhubung ke database.
  // Ini hanya mengembalikan JSON sederhana untuk tes.
  try {
    const testData = {
      message: "Tes build berhasil. Vercel menjalankan kode baru.",
      timestamp: new Date().toISOString()
    };
    // Gunakan sintaks yang sudah kita tahu benar
    return NextResponse.json(testData, { status: 200 });
  } catch (error) {
    // Blok ini seharusnya tidak akan pernah dieksekusi
    return NextResponse.json({ error: "Terjadi error tak terduga pada kode tes." }, { status: 500 });
  }
}

export async function POST(request) {
    // Kembalikan respons sukses sederhana untuk tes POST juga
    return NextResponse.json({ message: "Tes POST berhasil." }, { status: 200 });
}