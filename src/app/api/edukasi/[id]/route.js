import connectDB from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// 1. DELETE: Hapus Video
export async function DELETE(request, { params }) {
  let connection;
  try {
    const { id } = await params; // Next.js 16 requires await
    connection = await connectDB();

    await connection.query("DELETE FROM edukasi WHERE edukasiID = ?", [id]);

    return NextResponse.json({ message: "Video berhasil dihapus" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

// 2. PUT: Update Video (Edit)
export async function PUT(request, { params }) {
  let connection;
  try {
    const { id } = await params;
    const body = await request.json();
    const { judul, isi, thumbnail } = body;

    connection = await connectDB();

    // Update judul, deskripsi (isi), dan thumbnail
    const query = "UPDATE edukasi SET judul = ?, isi = ?, thumbnail = ? WHERE edukasiID = ?";
    await connection.query(query, [judul, isi, thumbnail, id]);

    return NextResponse.json({ message: "Video berhasil diupdate" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}