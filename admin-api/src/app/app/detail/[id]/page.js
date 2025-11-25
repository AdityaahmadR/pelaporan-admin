// src/app/app/detail/[id]/page.js
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../app.module.css';
import detailStyles from './Detail.module.css';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

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
  } catch (error) {
    console.error('Fetch error:', error);
    return notFound();
  }

  if (!laporan) return notFound();

  const isiLaporan = String(laporan.isi_laporan || laporan.deskripsi || '').trim();
  const namaPelapor = String(laporan.nama_pelapor || 'Masyarakat').trim() || 'Masyarakat';
  const email = String(laporan.email || '-');

  const tanggal = laporan.tanggal && !isNaN(new Date(laporan.tanggal).getTime())
    ? new Date(laporan.tanggal)
    : new Date();

  const gambarMatch = isiLaporan.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)(\?[^\s]*)?)/i);
  const gambarUrl = gambarMatch ? gambarMatch[0] : null;
  const isiBersih = isiLaporan.replace(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)(\?[^\s]*)?)/gi, '').trim();
  const judul = isiBersih.split('\n')[0]?.trim() || 'Laporan Darurat';
  const inisial = namaPelapor[0]?.toUpperCase() || 'M';

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
            <div className={detailStyles.avatar}>{inisial}</div>
            <div>
              <h3 className={detailStyles.pelaporName}>{namaPelapor}</h3>
              <p className={detailStyles.pelaporEmail}>{email}</p>
            </div>
            <div className={detailStyles.waktu}>
              {tanggal.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              <br />
              <strong>{tanggal.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</strong>
            </div>
          </div>

          <div className={detailStyles.isiLaporan}>
            {isiBersih || 'Tidak ada deskripsi.'}
          </div>

          {gambarUrl && (
            <div className={detailStyles.gambarContainer}>
              <img src={gambarUrl} alt="Bukti laporan" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
          )}

          <div className={detailStyles.lokasi}>
            <span>Location</span>
            <div className={detailStyles.pulseDot} />
          </div>
        </div>
      </main>
    </div>
  );
}