"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import styles from "../darurat/darurat.module.css";
import LaporanPreviewCard from "../../components/LaporanPreviewCard";

export default function LaporanDarurat() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/laporan");
        const data = await res.json();

        setLaporan(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Fetch gagal:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div
      className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ""}`}
    >
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        activePage="/darurat"
      />

      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ""}`}>
        <header className={styles.header}>
          <h2>Laporan Masyarakat</h2>
        </header>

        {loading && <p>Memuat data...</p>}

        {!loading && laporan.length === 0 && (
          <p className={styles.emptyState}>Belum ada laporan darurat</p>
        )}

        {/* LIST DATA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {laporan.map((item) => (
            <LaporanPreviewCard
              key={item.laporanID}
              title={
                item.deskripsi.length > 25
                  ? item.deskripsi.substring(0, 25) + "..."
                  : item.deskripsi
              }
              description={item.deskripsi}
              status={item.status || "Laporan Masuk"}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
