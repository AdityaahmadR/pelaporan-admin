// api/reports/route.js
import { PrismaClient } from '@prisma/client';

// Prisma Client singleton (biar koneksi tidak dibuat ulang tiap request)
const globalForPrisma = global;
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}
const prisma = globalForPrisma.prisma;

// GET → ambil semua laporan (bisa filter ?type=darurat)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    const reports = await prisma.reports.findMany({
      where: type ? { type } : {},
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        location: true,
        status: true,
        createdAt: true,
      },
    });

    return Response.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return Response.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
  }
}

// POST → tambah laporan baru
export async function POST(request) {
  try {
    const body = await request.json();

    const newReport = await prisma.reports.create({
      data: {
        type: body.type || 'manual',
        title: body.title,
        description: body.description || null,
        location: body.location || null,
        status: 'baru',
      },
    });

    return Response.json({ success: true, data: newReport }, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return Response.json({ success: false, message: 'Gagal menyimpan laporan' }, { status: 500 });
  }
}