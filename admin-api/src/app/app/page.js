"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import styles from "../darurat/darurat.module.css";
import LaporanPreviewCard from "../../components/LaporanPreviewCard";

export default function LaporanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/laporan");

        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const data = await res.json();
        setLaporan(Array.isArray(data) ? data : []);

      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ""}`}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/app" />

      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ""}`}>
        <header className={styles.header}>
          <h2>Laporan Masyarakat</h2>
        </header>

        {loading && <p>Memuat data...</p>}
        {fetchError && <p style={{ color: "red" }}>⚠ {fetchError}</p>}

        {!loading && laporan.length === 0 && (
          <p className={styles.emptyState}>Belum ada laporan</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {laporan.map((item) => (
            <LaporanPreviewCard
              key={item.laporanID}
              title={item.deskripsi?.split("\n")[0] || "Tanpa Judul"}
              description={item.deskripsi}
              status={item.status}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
