// src/app/app/page.js
'use client';

import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import Link from 'next/link';
import styles from './app.module.css';
import { useState, useEffect } from 'react';

export default function LaporanMasyarakat() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [laporanList, setLaporanList] = useState([]);

  useEffect(() => {
    fetch('/api/laporan/ambilLaporan', { cache: 'no-store' })
      .then(res => res.ok ? res.json() : [])
      .then(data => setLaporanList(data))
      .catch(() => setLaporanList([]));
  }, []);

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
      
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/app" />

      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" alt="Search" width={20} height={20} className={styles.searchIcon} />
            <input type="text" placeholder="Cari laporan..." className={styles.searchInput} />
          </div>
        </div>

        <button className={styles.uploadButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Upload</span>
        </button>
      </div>

      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <header className={styles.header}>
          <h2>Laporan Masyarakat</h2>
        </header>

        {laporanList.length === 0 ? (
          <section className={styles.emptyState}>
            <p>Belum ada laporan masyarakat</p>
          </section>
        ) : (
          <div className={styles.grid}>
            {laporanList.map((laporan) => {
              const desc = String(laporan.deskripsi || '');
              const imgMatch = desc.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
              const img = imgMatch ? imgMatch[0] : null;
              const text = desc.replace(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi, '').trim();
              const title = text.split('\n')[0]?.slice(0, 80) || 'Laporan Masyarakat';
              const nama = laporan.nama_pelapor || 'Masyarakat';

              return (
                <Link key={laporan.laporanID} href={`/app/detail/${laporan.laporanID}`} className={styles.card}>
                  {img && <img src={img} alt="Bukti" className={styles.cardImg} onError={e => e.target.style.display = 'none'} />}
                  <div className={styles.cardBody}>
                    <h3>{title}</h3>
                    <p>Oleh: {nama}</p>
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