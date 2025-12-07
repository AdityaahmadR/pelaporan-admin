"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LaporanPreviewCard from "@/components/LaporanPreviewCard"; // Import Card
import styles from "@/app/darurat/darurat.module.css";
import Image from "next/image";

export default function LaporanDarurat() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // State Data
  const [laporanDarurat, setLaporanDarurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch Data Khusus Darurat
  useEffect(() => {
    async function loadData() {
      try {
        // PERUBAHAN DI SINI: Filter khusus 'darurat'
        const res = await fetch("/api/laporan?prioritas=darurat");
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setLaporanDarurat(data);
        }
      } catch (err) {
        console.error("Gagal ambil data darurat:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredData = laporanDarurat.filter((item) =>
    item.deskripsi?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/darurat" />

      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" alt="Search" width={20} height={20} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search Darurat..." 
              className={styles.searchInput} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <button 
          className={styles.uploadButton}
          onClick={() => router.push('/app/edukasi')}
        >
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
          {/* Judul Merah agar terlihat beda dan urgent */}
          <h2 style={{color: '#d71c1c'}}>Laporan Darurat</h2>
        </header>
        
        {loading && <p>⏳ Memuat data darurat...</p>}

        {!loading && filteredData.length === 0 && (
          <section className={styles.emptyState}>
            <p>Tidak ada laporan darurat saat ini.</p>
          </section>
        )}

        {/* Render Card Laporan Darurat */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredData.map((item) => (
             <LaporanPreviewCard
               key={item.laporanID}
               laporanID={item.laporanID}  
               title={item.deskripsi?.split("\n")[0] || "DARURAT"} // Ambil baris pertama deskripsi sbg judul
               description={item.deskripsi}
               status={item.status}
             />
          ))}
        </div>

      </main>
    </div>
  );
}