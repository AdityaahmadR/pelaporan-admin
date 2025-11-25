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

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/laporan/${id}`, {
    cache: 'no-store'
  });

  if (!res.ok) notFound();
  const laporan = await res.json();

  const isiLaporan = laporan.isi_laporan || '';
  const gambarMatch = isiLaporan.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif))/i);
  const gambarUrl = gambarMatch ? gambarMatch[0] : null;
  const isiBersih = isiLaporan.replace(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif))/gi, '').trim();
  const judul = isiBersih.split('\n')[0]?.trim() || 'Laporan Darurat';

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
          <div className={detailStyles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <Link href="/app" className={detailStyles.backLink}>Back</Link>
              <h1 className={detailStyles.title}>{judul}</h1>
            </div>
            <button className={detailStyles.terimaButton}>Terima Laporan</button>
          </div>

          <div className={detailStyles.pelaporCard}>
            <div className={detailStyles.avatar}>
              {laporan.nama_pelapor?.[0]?.toUpperCase() || 'M'}
            </div>
            <div>
              <h3 className={detailStyles.pelaporName}>{laporan.nama_pelapor || 'Masyarakat'}</h3>
              <p className={detailStyles.pelaporEmail}>{laporan.email || '-'}</p>
            </div>
            <div className={detailStyles.waktu}>
              {new Date(laporan.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              <br />
              <strong>{new Date(laporan.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</strong>
            </div>
          </div>

          <div className={detailStyles.isiLaporan}>
            {isiBersih || 'Tidak ada deskripsi.'}
          </div>

          {gambarUrl && (
            <div className={detailStyles.gambarContainer}>
              <img src={gambarUrl} alt="Bukti laporan" />
            </div>
          )}

          <div className={detailStyles.lokasi}>
            <span>Location</span>
            <div className={detailStyles.pulseDot}></div>
          </div>
        </div>
      </main>
    </div>
  );
}