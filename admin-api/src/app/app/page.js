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
    if (res.ok) laporanList = await res.json();
  } catch (error) {
    console.error('Gagal ambil laporan:', error);
  }

  return (
    <div className={styles.page}>
      <Sidebar /> {/* INI SAJA — SUDAH JALAN SENDIRI */}

      <main className={styles.main}>
        <div className={styles.topBar}>
          <div className={styles.searchWrapper}>
            <div className={styles.searchBar}>
              <Image src="/Search.png" alt="Search" width={20} height={20} className={styles.searchIcon} />
              <input type="text" placeholder="Cari laporan..." className={styles.searchInput} disabled />
            </div>
          </div>
          <button className={styles.uploadButton}>Upload</button>
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>Daftar Laporan Darurat</h1>

          {laporanList.length === 0 ? (
            <p className={styles.empty}>Belum ada laporan masuk.</p>
          ) : (
            <div className={styles.grid}>
              {laporanList.map((laporan) => {
                const deskripsi = String(laporan.deskripsi || '');
                const gambarMatch = deskripsi.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
                const gambarUrl = gambarMatch ? gambarMatch[0] : null;
                const teksBersih = deskripsi.replace(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi, '').trim();
                const judul = teksBersih.split('\n')[0]?.slice(0, 80) || 'Laporan Darurat';
                const nama = String(laporan.nama_pelapor || 'Masyarakat');

                return (
                  <Link key={laporan.laporanID} href={`/app/detail/${laporan.laporanID}`} className={styles.card}>
                    {gambarUrl && <img src={gambarUrl} alt="Bukti" className={styles.cardImg} />}
                    <div className={styles.cardBody}>
                      <h3>{judul}</h3>
                      <p>Oleh: {nama}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}