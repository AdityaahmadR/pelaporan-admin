// src/app/app/page.js
"use client";

import styles from './app.module.css';
import Sidebar from '../../components/Sidebar';
import LaporanCard from '@/components/LaporanCard';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AppPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [laporanList, setLaporanList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        const res = await fetch('/api/laporan/ambilLaporan', { cache: 'no-store' });
        if (!res.ok) throw new Error('Gagal ambil data');
        const data = await res.json();
        setLaporanList(data);
      } catch (err) {
        console.error('Error fetch laporan:', err);
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#999' }}>
            Memuat laporan...
          </div>
        ) : laporanList.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Belum ada laporan masuk</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {laporanList.map((laporan) => (
              <LaporanCard key={laporan.laporanID} laporan={laporan} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}