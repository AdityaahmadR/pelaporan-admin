// src/app/api/semua-laporan/[id]/route.js
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";

// Mencegah caching statis agar data selalu fresh
export const dynamic = 'force-dynamic';

// --- FUNGSI GET (Ambil Detail Laporan) ---
export async function GET(request, { params }) {
  let connection;
  try {
    // FIX NEXT.JS 16: Params harus di-await
    const { id } = await params;

    connection = await connectDB();

    const query = `
      SELECT 
        laporan.*, 
        users.nama as user_nama,
        users.email as user_email
      FROM laporan 
      LEFT JOIN users ON laporan.userID = users.userID 
      WHERE laporan.laporanID = ?
    `;
    const [rows] = await connection.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Laporan tidak ditemukan" }, 
        { status: 404 }
      );
    }

    const dataRaw = rows[0];
    let subjectDisplay = `Laporan #${dataRaw.laporanID}`;
    let finalDeskripsi = dataRaw.deskripsi || "";
    let imageUrl = null;

    // Logika Pemisahan Gambar & Subject dari Deskripsi
    if (finalDeskripsi) {
      const imageRegex = /(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp))/i;
      const imageMatch = finalDeskripsi.match(imageRegex);
      if (imageMatch) {
        imageUrl = imageMatch[0];
        finalDeskripsi = finalDeskripsi.replace(imageUrl, "").replace(/Gambar:\s*/i, "");
      }
      
      let lines = finalDeskripsi.split('\n');
      const subjectIndex = lines.findIndex(line => line.toLowerCase().includes("subjek:"));
      if (subjectIndex !== -1) {
        subjectDisplay = lines[subjectIndex].replace(/subjek:/i, "").trim();
        lines.splice(subjectIndex, 1);
      }
      finalDeskripsi = lines.join('\n').trim();
    }

    const formattedData = {
      ...dataRaw,
      subject: subjectDisplay,
      isi_laporan: finalDeskripsi,
      gambar: imageUrl,
      createdAt: dataRaw.tanggal,
      user: {
        nama: dataRaw.user_nama || "Anonim",
        email: dataRaw.user_email || "-"
      }
    };

    return NextResponse.json({ data: formattedData }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message }, 
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// --- FUNGSI PUT (Update Status Laporan) ---
export async function PUT(request, { params }) {
  let connection;
  try {
    // FIX NEXT.JS 16: Params harus di-await
    const { id } = await params;
    
    // Parse JSON body
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ message: "Status harus diisi" }, { status: 400 });
    }

    connection = await connectDB();
    await connection.query("UPDATE laporan SET status = ? WHERE laporanID = ?", [status, id]);

    return NextResponse.json({ message: "Status berhasil diupdate" }, { status: 200 });

  } catch (error) {
    console.error("API PUT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}