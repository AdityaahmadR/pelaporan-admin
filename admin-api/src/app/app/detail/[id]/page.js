// src/app/app/detail/[id]/page.js
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../app.module.css';
import detailStyles from './Detail.module.css';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DetailLaporan({ params }) {
  const { id } = params;

  // FIX URL: Jalan di lokal & Vercel (nggak error Invalid URL lagi)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || '';
  const apiUrl = baseUrl ? `${baseUrl}/api/laporan/${id}` : `/api/laporan/${id}`;

  let laporan = null;

  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });

    if (!res.ok) {
      if (res.status === 404) return notFound();
      throw new Error(`HTTP ${res.status}`);
    }

    laporan = await res.json();
  } catch (err) {
    console.error('Gagal fetch laporan:', err);
    return notFound();
  }

  // AMAN 100% DARI NULL/UNDEFINED
  const isiLaporan = String(laporan.isi_laporan || '');
  const namaPelapor = String(laporan.nama_pelapor || 'Masyarakat').trim();
  const email = String(laporan.email || '-');
  const tanggal = laporan.tanggal ? new Date(laporan.tanggal) : new Date();

  // Ekstrak gambar
  const gambarMatch = isiLaporan.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif))/i);
  const gambarUrl = gambarMatch ? gambarMatch[0] : null;

  // Bersihkan gambar dari teks
  const isiBersih = isiLaporan.replace(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif))/gi, '').trim();
  const judul = isiBersih.split('\n')[0]?.trim() || 'Laporan Darurat';

  // Inisial aman
  const inisial = namaPelapor ? namaPelapor[0].toUpperCase() : 'M';

  return (
    <div className={styles.page}>
      <Sidebar isOpen={true} setIsOpen={() => {}} activePage="/app" />

      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" alt="Search" width={20} height={20} className={styles.searchIcon} />
            <input type="text" placeholder="Search" className={styles.searchInput} disabled />
          </div>
        </div>
        <button className={styles.uploadButton}>Upload</button>
      </div>

      <main className={styles.content}>
        <div className={detailStyles.container}>
          {/* HEADER */}
          <div className={detailStyles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <Link href="/app" className={detailStyles.backLink}>Back</Link>
              <h1 className={detailStyles.title}>{judul}</h1>
            </div>
            <button className={detailStyles.terimaButton}>Terima Laporan</button>
          </div>

          {/* PELAPOR */}
          <div className={detailStyles.pelaporCard}>
            <div className={detailStyles.avatar}>{inisial}</div>
            <div>
              <h3 className={detailStyles.pelaporName}>{namaPelapor}</h3>
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
              <strong>
                {tanggal.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </strong>
            </div>
          </div>

          {/* ISI LAPORAN */}
          <div className={detailStyles.isiLaporan}>
            {isiBersih || 'Tidak ada deskripsi.'}
          </div>

          {/* GAMBAR BUKTI */}
          {gambarUrl && (
            <div className={detailStyles.gambarContainer}>
              <img src={gambarUrl} alt="Bukti laporan" />
            </div>
          )}

          {/* LOKASI */}
          <div className={detailStyles.lokasi}>
            <span>Location</span>
            <div className={detailStyles.pulseDot}></div>
          </div>
        </div>
      </main>
    </div>
  );
}