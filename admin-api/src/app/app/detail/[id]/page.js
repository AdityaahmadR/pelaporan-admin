// src/app/app/detail/[id]/page.js
import Sidebar from '@/components/Sidebar';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import detailStyles from './Detail.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DetailLaporan({ params }) {
  const { id } = params;
  const host = headers().get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const apiUrl = `${protocol}://${host}/api/laporan/${id}`;

  let laporan = null;
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) return notFound();
    laporan = await res.json();
  } catch {
    return notFound();
  }

  if (!laporan) return notFound();

  const isi = String(laporan.isi_laporan || laporan.deskripsi || '');
  const nama = String(laporan.nama_pelapor || 'Masyarakat');
  const tanggal = new Date(laporan.tanggal || Date.now());
  const gambarMatch = isi.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
  const gambarUrl = gambarMatch ? gambarMatch[0] : null;
  const isiBersih = isi.replace(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi, '').trim();
  const judul = isiBersih.split('\n')[0] || 'Laporan Darurat';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '32px', marginLeft: '80px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '32px' }}>{judul}</h1>
        <p><strong>Oleh:</strong> {nama}</p>
        <p><strong>Tanggal:</strong> {tanggal.toLocaleDateString('id-ID')}</p>
        <div style={{ margin: '32px 0', lineHeight: '1.8', fontSize: '18px' }}>{isiBersih || 'Tidak ada deskripsi.'}</div>
        {gambarUrl && <img src={gambarUrl} alt="Bukti" style={{ maxWidth: '100%', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} />}
      </main>
    </div>
  );
}