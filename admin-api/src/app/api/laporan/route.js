import { NextResponse } from 'next/server';

// Beritahu Vercel ini adalah route dinamis
export const dynamic = 'force-dynamic';

export async function GET(request) {  // Langsung kembalikan data contoh sederhana
  // Ini untuk menguji apakah Vercel mau menjalankan kode yang baru
  const dummyData = [
    { id: 99, deskripsi: "Tes build berhasil", lokasi: "Vercel" }
  ];
  
  return NextResponse.json(dummyData, { status: 200 });
}

export async function POST(request) {
    // Kembalikan respons sukses sederhana untuk tes
    return NextResponse.json({ message: "Tes POST berhasil" }, { status: 200 });
}
