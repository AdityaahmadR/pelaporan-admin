import db from "@/lib/db";

export async function GET(_, { params }) {
  try {
    const [rows] = await db.query("SELECT * FROM laporan WHERE id = ?", [
      params.id,
    ]);

    return new Response(JSON.stringify(rows[0]), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
