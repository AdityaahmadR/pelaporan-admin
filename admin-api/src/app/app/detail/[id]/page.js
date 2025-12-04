"use client";

import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import detailStyles from "./Detail.module.css";
import styles from "../../darurat/darurat.module.css";
import Image from "next/image";

export default function DetailPage({ params }) {
  const { id } = params;
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeAgo, setTimeAgo] = useState("");

  const statusOptions = {
    baru: "Laporan Masuk",
    diproses: "Sedang Diproses",
    selesai: "Selesai",
  };

  const reverseStatus = {
    "Laporan Masuk": "baru",
    "Sedang Diproses": "diproses",
    "Selesai": "selesai",
  };

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/laporan/${id}`);
        const data = await res.json();
        setLaporan(data);

        updateTime(data.tanggal);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

  function updateTime(dateString) {
    const date = new Date(dateString);
    const selisih = Math.floor((Date.now() - date.getTime()) / 60000);

    setTimeAgo(
      selisih < 1 ? "Baru saja" :
      selisih < 60 ? `${selisih} menit lalu` :
      `${Math.floor(selisih / 60)} jam lalu`
    );
  }

  async function handleStatusChange(e) {
    const newStatus = reverseStatus[e.target.value];

    await fetch(`/api/laporan/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setLaporan((prev) => ({ ...prev, status: newStatus }));

    // Trigger refresh preview list
    localStorage.setItem("laporan_updated", Date.now());
  }

  if (loading) return <p>Loading...</p>;
  if (!laporan) return <p>Data tidak ditemukan</p>;

  const gambarMatch = laporan.deskripsi?.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i);
  const gambarUrl = gambarMatch ? gambarMatch[0] : null;
  const isiBersih = laporan.deskripsi.replace(gambarMatch?.[0] || "", "").trim();

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ""}`}>

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={styles.topBar}>
        {/* Search bar sama seperti list */}
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" width={20} height={20} alt="search"/>
            <input placeholder="Search laporan..." disabled/>
          </div>
        </div>

        <button className={styles.uploadButton}>Upload</button>
      </div>

      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ""}`}>

        <div className={detailStyles.header}>
          <button onClick={() => router.back()} className={detailStyles.backBtn}>←</button>

          <h1 className={detailStyles.title}>{isiBersih.split("\n")[0] || "Tanpa Judul"}</h1>

          <select
            className={detailStyles.dropdown}
            value={statusOptions[laporan.status]}
            onChange={handleStatusChange}
          >
            <option>Laporan Masuk</option>
            <option>Sedang Diproses</option>
            <option>Selesai</option>
          </select>
        </div>

        <p className={detailStyles.time}>{timeAgo}</p>

        <div className={detailStyles.userCard}>
          <div className={detailStyles.avatar}>{laporan.nama_pelapor?.charAt(0)}</div>
          <div>
            <h3>{laporan.nama_pelapor}</h3>
            <p>{laporan.email}</p>
          </div>
        </div>

        <div className={detailStyles.isi}>{isiBersih}</div>

        {gambarUrl && (
          <div className={detailStyles.imageBox}>
            <img src={gambarUrl} alt="Bukti"/>
          </div>
        )}

      </main>
    </div>
  );
}
