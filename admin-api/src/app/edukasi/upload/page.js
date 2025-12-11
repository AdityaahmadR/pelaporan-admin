"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import styles from './Upload.module.css';

// 1. KOMPONEN KONTEN (Memisahkan logika yang pakai useSearchParams)
function EditVideoContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); 

  // Ambil data file dari URL
  const fileName = searchParams.get('name') || "Untitled_Video";
  const fileSizeTotal = parseFloat(searchParams.get('size')) || 0;

  // Form State
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [sampul, setSampul] = useState(null);
  const [progress, setProgress] = useState(0);

  // Simulasi Progress Bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 1; 
      });
    }, 100); 

    return () => clearInterval(interval);
  }, []);

  const uploadedSize = ((progress / 100) * fileSizeTotal).toFixed(1);

  // Handle Inputs
  const handleJudulChange = (e) => {
    if (e.target.value.length <= 100) setJudul(e.target.value);
  };

  const handleDeskripsiChange = (e) => {
    if (e.target.value.length <= 2000) setDeskripsi(e.target.value);
  };

  const handleSampulChange = (e) => {
    const file = e.target.files[0];
    if (file) setSampul(URL.createObjectURL(file));
  };

  // Upload ke Database
  const handleUnggah = async () => {
    if (!judul) {
      alert("Judul tidak boleh kosong!");
      return;
    }

    // Paksa progress jadi 100%
    setProgress(100);

    const videoData = {
      judul: judul,
      isi: deskripsi || "/placeholder-video", 
      kategori: "video"
    };

    try {
      const res = await fetch('/api/edukasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData)
      });

      if (res.ok) {
        setTimeout(() => {
          alert("Video Berhasil Diunggah!");
          router.push('/app/edukasi'); // Kembali ke halaman list
        }, 500);
      } else {
        alert("Gagal mengunggah");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className={styles.card}>
      
      {/* HEADER INFO */}
      <div className={styles.videoHeader}>
        <div className={styles.videoIcon}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
             <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
        <div className={styles.videoMeta}>
          <h3 className={styles.fileName}>{fileName}</h3>
          <p className={styles.fileDetails}>Durasi: --:-- &nbsp;&nbsp; Ukuran: {fileSizeTotal}MB</p>
          
          {/* PROGRESS BAR */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
            <div className={styles.progressText}>
              <span>{uploadedSize}MB / {fileSizeTotal}MB</span>
              <span>{Math.floor(progress)}%</span>
            </div>
          </div>
          
          <div className={styles.lightningIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
               <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Informasi Dasar</h2>

      {/* INPUT JUDUL */}
      <div className={styles.inputGroup}>
        <label className={styles.label}>Judul</label>
        <div className={styles.inputWrapper}>
          <input 
            type="text" 
            placeholder="Masukkan Judul Anda..." 
            className={styles.textInput}
            value={judul}
            onChange={handleJudulChange}
          />
          <span className={`${styles.counter} ${styles.counterInput}`}>
            {judul.length}/100
          </span>
        </div>
      </div>

      {/* INPUT DESKRIPSI */}
      <div className={styles.inputGroup}>
        <label className={styles.label}>Deskripsi</label>
        <div className={styles.inputWrapper}>
          <textarea 
            placeholder="Masukkan Deskripsi Video Anda...." 
            className={styles.textArea}
            value={deskripsi}
            onChange={handleDeskripsiChange}
          />
          <span className={`${styles.counter} ${styles.counterArea}`}>
            {deskripsi.length}/2000
          </span>
        </div>
      </div>

      {/* INPUT SAMPUL */}
      <div className={styles.inputGroup}>
        <label className={styles.label}>Sampul</label>
        <label className={styles.coverUploadBox}>
          <input type="file" style={{display:'none'}} accept="image/*" onChange={handleSampulChange} />
          
          {sampul ? (
             <img src={sampul} alt="Preview" className={styles.coverPreview} />
          ) : (
            <div className={styles.uploadPlaceholder}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginBottom:10}}>
                 <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                 <polyline points="17 8 12 3 7 8"></polyline>
                 <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p style={{margin:0, fontWeight:600}}>Unggah Sampul</p>
            </div>
          )}
        </label>
      </div>

      {/* BUTTONS */}
      <div className={styles.actionButtons}>
        <button className={styles.btnBatal} onClick={() => router.back()}>
          Batal
        </button>
        <button className={styles.btnUnggah} onClick={handleUnggah}>
          Unggah
        </button>
      </div>

    </div>
  );
}

// 2. HALAMAN UTAMA (Parent Component dengan Suspense)
export default function EditVideoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={styles.page}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/edukasi" />

      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        {/* Suspense Boundary Wajib di Next.js 16 untuk Client Component yang pakai useSearchParams */}
        <Suspense fallback={<p style={{padding: 40, textAlign:'center'}}>Memuat data upload...</p>}>
          <EditVideoContent />
        </Suspense>
      </main>
    </div>
  );
}