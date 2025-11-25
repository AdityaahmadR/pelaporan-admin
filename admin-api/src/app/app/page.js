// src/app/app/page.js
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import Link from 'next/link';
import styles from './app.module.css';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AppPage() {
  const host = headers().get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const apiUrl = `${protocol}://${host}/api/laporan/ambilLaporan`;

  let laporanList = [];

  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (res.ok) {
      laporanList = await res.json();
    }
  } catch (error) {
    console.error('Gagal fetch laporan:', error);
  }

  return (
    <div className={styles.page}>
      <Sidebar isOpen={true} setIsOpen={() => {}} activePage="/app" />

      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" alt="Search" width={20} height={20} className={styles.searchIcon} />
            <input type="text" placeholder="Cari laporan..." className={styles.searchInput} disabled />
          </div>
        </div>
        <button className={styles.uploadButton}>Upload</button>
      </div>

      <main className={styles.content}>
        <h1 className={styles.title}>Daftar Laporan Darurat</h1>

        {laporanList.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Belum ada laporan masuk.</p>
          </div>
        ) : (
          <div className={styles.laporanGrid}>
            {laporanList.map((laporan) => {
              const deskripsi = String(laporan.deskripsi || '');
              const gambarMatch = deskripsi.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
              const gambarUrl = gambarMatch ? gambarMatch[0] : null;
              const teksBersih = deskripsi.replace(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi, '').trim();
              const judul = teksBersih.split('\n')[0]?.slice(0, 80) || 'Laporan Darurat';
              const nama = String(laporan.nama_pelapor || 'Masyarakat');

              return (
                <Link
                  key={laporan.laporanID}
                  href={`/app/detail/${laporan.laporanID}`}
                  className={styles.laporanCard}
                >
                  {gambarUrl && (
                    <div className={styles.cardImage}>
                      <img src={gambarUrl} alt="Bukti" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                  <div className={styles.cardContent}>
                    <h3>{judul}</h3>
                    <p className={styles.pelapor}>Oleh: {nama}</p>
                    <p className={styles.tanggal}>
                      {new Date(laporan.tanggal || Date.now()).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}