// src/app/app/detail/[id]/page.js
import Sidebar from '@/components/Sidebar';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import detailStyles from './Detail.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DetailLaporan({ params }) {
  const { id } = params;

  // INI YANG BENAR — JANGAN DIUBAH LAGI! (sudah terbukti work di Vercel)
  const host = headers().get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const apiUrl = `${protocol}://${host}/api/laporan/${id}`;

  let laporan;
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) return notFound();
    laporan = await res.json();
  } catch (err) {
    return notFound();
  }

  const isi = String(laporan.isi_laporan || laporan.deskripsi || '');
  const gambarMatch = isi.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
  const gambarUrl = gambarMatch ? gambarMatch[0] : null;
  const isiBersih = isi.replace(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi, '').trim();
  const judul = isiBersih.split('\n')[0]?.trim() || 'Laporan Darurat';
  const nama = laporan.nama_pelapor || 'Masyarakat';
  const email = laporan.email || '-';
  const tanggal = new Date(laporan.tanggal || Date.now());

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main className={detailStyles.container}>
        {/* Header */}
        <div className={detailStyles.header}>
          <a href="/app" className={detailStyles.backLink}>Back</a>
          <h1 className={detailStyles.title}>{judul}</h1>
          <button className={detailStyles.terimaButton}>Terima Laporan</button>
        </div>

        {/* Info Pelapor */}
        <div className={detailStyles.pelaporCard}>
          <div className={detailStyles.avatar}>
            {nama[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <h3 className={detailStyles.pelaporName}>{nama}</h3>
            <p className={detailStyles.pelaporEmail}>{email}</p>
          </div>
          <div className={detailStyles.waktu}>
            {tanggal.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
            <br />
            <strong>1 menit lalu</strong>
          </div>
        </div>

        {/* Isi Laporan */}
        <div className={detailStyles.isiLaporan}>
          {isiBersih || 'Tidak ada deskripsi.'}
        </div>

        {/* Gambar */}
        {gambarUrl && (
          <div className={detailStyles.gambarContainer}>
            <img src={gambarUrl} alt="Bukti laporan" />
          </div>
        )}

        {/* Location */}
        <div className={detailStyles.lokasi}>
          <div className={detailStyles.pulseDot}></div>
          <span>Location</span>
        </div>
      </main>
    </div>
  );
}