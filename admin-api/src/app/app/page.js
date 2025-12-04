"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import styles from "@/app/darurat/darurat.module.css";

export default function DetailPage({ params }) {
  const { id } = params;
  const [laporan, setLaporan] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/laporan/${id}`);
      const data = await res.json();
      setLaporan(data);
    };

    fetchData();
  }, [id]);

  if (!laporan) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <SearchBar />
        <h1>Detail Laporan #{id}</h1>

        <div className={styles.box}>
          <p><strong>Nama Pelapor:</strong> {laporan.nama}</p>
          <p><strong>Jenis Laporan:</strong> {laporan.jenis}</p>
          <p><strong>Lokasi:</strong> {laporan.lokasi}</p>
          <p><strong>Status:</strong> {laporan.status}</p>
        </div>
      </div>
    </div>
  );
}
