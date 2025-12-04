import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const [rows] = await db.query(
      `SELECT laporan.*, users.nama 
       FROM laporan 
       LEFT JOIN users ON laporan.userID = users.userID 
       WHERE laporan.laporanID = ?`,
      [params.id]
    );

    if (!rows.length) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const { status } = body;

    await db.query(`UPDATE laporan SET status = ? WHERE laporanID = ?`, [
      status,
      params.id,
    ]);

    return NextResponse.json({ success: true, status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
