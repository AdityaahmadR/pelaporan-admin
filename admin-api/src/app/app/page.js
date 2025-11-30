// src/app/app/page.js
'use client';

import LaporanPreviewCard from '@/components/LaporanPreviewCard';
import styles from './app.module.css';
import { useEffect, useState } from 'react';

export default function LaporanMasyarakat() {
  const [laporanList, setLaporanList] = useState([]);

  useEffect(() => {
    fetch('/api/laporan/ambilLaporan', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(setLaporanList);
  }, []);

  return (
    <>
      <header className={styles.header}>
        <h2>Laporan Masyarakat</h2>
      </header>

      {laporanList.length === 0 ? (
        <div className={styles.emptyState}>Belum ada laporan masyarakat</div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '28px',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))'
        }}>
          {laporanList.map(laporan => (
            <LaporanPreviewCard key={laporan.laporanID} laporan={laporan} />
          ))}
        </div>
      )}
    </>
  );
}