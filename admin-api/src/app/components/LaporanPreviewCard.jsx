"use client";
import styles from "./LaporanPreviewCard.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LaporanPreviewCard({ laporanID, title, description, status }) {
  const router = useRouter();

  const safeTitle = title || "Tanpa Judul";
  const safeDescription = description || "-";
  const safeStatus = status || "Laporan Masuk";

  const [currentStatus, setCurrentStatus] = useState(safeStatus);

  const statusStyle = {
    "Laporan Masuk": styles.badgeMasuk,
    "Sedang Diproses": styles.badgeProses,
    "Selesai": styles.badgeSelesai,
  };

  return (
    <div
      className={styles.card}
      onClick={() => router.push(`/app/detail/${laporanID}`)} 
      style={{ cursor: "pointer" }}
    >
      {/* TEKS */}
      <div className={styles.textSection}>
        <h3 className={styles.title}>{safeTitle}</h3>
        <p className={styles.desc}>{safeDescription}</p>
      </div>

      {/* DROPDOWN */}
      <div
        className={styles.dropdownWrapper}
        onClick={(e) => e.stopPropagation()} 
      >
        <select
          className={`${styles.dropdown} ${statusStyle[currentStatus]}`}
          value={currentStatus}
          onChange={(e) => setCurrentStatus(e.target.value)}
        >
          <option value="Laporan Masuk">Laporan Masuk</option>
          <option value="Sedang Diproses">Sedang Diproses</option>
          <option value="Selesai">Selesai</option>
        </select>
      </div>
    </div>
  );
}