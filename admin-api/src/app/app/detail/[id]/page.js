"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import styles from "../../dashboard/dashboard.module.css";

export default function DetailPage({ params }) {
  const { id } = params;

  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  async function fetchLaporan() {
    const res = await fetch(`/api/laporan/${id}`);
    const data = await res.json();
    setLaporan(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchLaporan();
  }, []);

  const updateStatus = async (newStatus) => {
    const res = await fetch(`/api/laporan/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      setLaporan((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const extractMedia = (text) => {
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    return urlMatch ? urlMatch[0] : null;
  };

  const extractSubject = (text) => {
    const match = text.match(/Subjek:(.+)/i);
    return match ? match[1].trim() : "Tanpa Subjek";
  };

  const formatTimeAgo = (dateString) => {
    const diffMs = new Date() - new Date(dateString);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours > 0 ? `${diffHours} jam lalu` : "Baru saja";
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  const image = extractMedia(laporan.deskripsi);
  const subject = extractSubject(laporan.deskripsi);

  return (
    <div className={styles.container}>
      <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={styles.content}>
        <SearchBar placeholder="Cari laporan..." />

        <div className={styles.card}>
          <h2>{subject}</h2>

          <p><strong>Pelapor:</strong> {laporan.nama || "Tidak diketahui"}</p>
          <p><strong>Status:</strong> {laporan.status}</p>
          <p><strong>Waktu:</strong> {formatTimeAgo(laporan.tanggal)}</p>

          <div style={{ marginTop: 10 }}>
            <button onClick={() => updateStatus("Sedang Diproses")}>
              Sedang Diproses
            </button>
            <button style={{ marginLeft: 10 }} onClick={() => updateStatus("Selesai")}>
              Selesaikan
            </button>
          </div>

          <hr style={{ margin: "20px 0" }} />

          <p style={{ whiteSpace: "pre-wrap" }}>{laporan.deskripsi}</p>

          {image && (
            <img
              src={image}
              alt="Bukti Laporan"
              style={{ width: "100%", marginTop: 15, borderRadius: 6 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
