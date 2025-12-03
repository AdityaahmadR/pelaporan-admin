"use client";
import styles from "./LaporanPreviewCard.module.css";
import { useState } from "react";

export default function LaporanPreviewCard({ title, description, status }) {
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
    <div className={styles.card}>
      <div className={styles.textSection}>
        <h3 className={styles.title}>{safeTitle}</h3>
        <p className={styles.desc}>{safeDescription}</p>
      </div>

      <div className={styles.dropdownWrapper}>
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
