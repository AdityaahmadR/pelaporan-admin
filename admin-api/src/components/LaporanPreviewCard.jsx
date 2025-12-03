"use client";
import { useState } from "react";
import styles from "./LaporanPreviewCard.module.css";

export default function LaporanPreviewCard({ data }) {
  const [status, setStatus] = useState(data.status);

  return (
    <div className={styles.card}>
      <div className={styles.leftContent}>
        <p className={styles.message}>{data.message}</p>
      </div>

      <div className={styles.rightContent}>
        <span className={styles.subject}>{data.subject}</span>

        <select
          className={`${styles.dropdown} ${styles[status]}`}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="masuk">Laporan Masuk</option>
          <option value="ongoing">Sedang Berlangsung</option>
          <option value="selesai">Selesai</option>
        </select>
      </div>
    </div>
  );
}
