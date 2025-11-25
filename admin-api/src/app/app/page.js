// src/app/app/page.js
"use client";

import styles from './app.module.css';
import Sidebar from '../../components/Sidebar';
import LaporanPreviewCard from '@/components/LaporanPreviewCard';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';

export default function AppPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [laporanList, setLaporanList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        const res = await fetch('/api/laporan/[id]', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setLaporanList(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLaporan();
    const interval = setInterval(fetchLaporan, 10000);
    return () => clearInterval(interval);
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
      </div>

      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <header className={styles.header}>
          <h2>Laporan Masyarakat</h2>
        </header>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Memuat laporan...</p>
        ) : laporanList.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Belum ada laporan masuk</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr' }}>
            {laporanList.map((laporan) => (
              <LaporanPreviewCard key={laporan.laporanID} laporan={laporan} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}