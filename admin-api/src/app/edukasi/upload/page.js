"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import styles from './Upload.module.css';

function EditVideoContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); 

  // --- CEK APAKAH SEDANG MODE EDIT ---
  const isEditMode = searchParams.get('mode') === 'edit';
  const editId = searchParams.get('id');
  const editTitle = searchParams.get('title') || "";
  const editDesc = searchParams.get('desc') || "";
  const editThumb = searchParams.get('thumb') || "";

  // Data File Baru (Hanya untuk Mode Upload Baru)
  const fileName = searchParams.get('name') || "Video Lama";
  const fileSizeTotal = parseFloat(searchParams.get('size')) || 0;

  // Form State (Isi default dengan data lama jika Edit Mode)
  const [judul, setJudul] = useState(isEditMode ? editTitle : "");
  const [deskripsi, setDeskripsi] = useState(isEditMode ? editDesc : "");
  
  // Thumbnail
  const [sampul, setSampul] = useState(isEditMode ? editThumb : null); // Preview
  const [sampulFile, setSampulFile] = useState(null); // File baru
  
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false); 

  // Simulasi Progress Bar (HANYA JALAN JIKA BUKAN EDIT MODE)
  useEffect(() => {
    if (isEditMode) return; // Stop progress bar di mode edit

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
  }, [isEditMode]);

  const uploadedSize = ((progress / 100) * fileSizeTotal).toFixed(1);

  // Handlers
  const handleJudulChange = (e) => { if (e.target.value.length <= 100) setJudul(e.target.value); };
  const handleDeskripsiChange = (e) => { if (e.target.value.length <= 2000) setDeskripsi(e.target.value); };
  const handleSampulChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSampul(URL.createObjectURL(file));
      setSampulFile(file);
    }
  };

  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const API_KEY = "0416af70555c12b73e1f822d3603c165"; 
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, { method: "POST", body: formData });
      const data = await res.json();
      return data.success ? data.data.url : null;
    } catch (error) { return null; }
  };

  // --- HANDLE SUBMIT (Bisa POST atau PUT tergantung mode) ---
  const handleSubmit = async () => {
    if (!judul) { alert("Judul wajib diisi!"); return; }
    setIsUploading(true);
    
    // 1. Cek Thumbnail
    let finalThumbnail = sampul; // Default pakai preview (bisa link lama atau blob baru)
    
    if (sampulFile) {
      // User pilih file baru -> Upload ke ImgBB
      const uploadedLink = await uploadToImgBB(sampulFile);
      if (uploadedLink) finalThumbnail = uploadedLink;
    } else if (!isEditMode && !sampul) {
      // Upload baru tapi gak pilih gambar -> Pakai placeholder
      finalThumbnail = "https://i.ibb.co/1fYKT5sb/b92bb4c90cef.jpg";
    }

    // 2. Siapkan Data
    const videoData = {
      judul: judul,
      isi: deskripsi || "/placeholder-video",
      kategori: "video",
      thumbnail: finalThumbnail
    };

    // 3. Tentukan URL & Method
    const url = isEditMode ? `/api/edukasi/${editId}` : '/api/edukasi';
    const method = isEditMode ? 'PUT' : 'POST';

    if (!isEditMode) setProgress(100);

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData)
      });

      if (res.ok) {
        setTimeout(() => {
          alert(isEditMode ? "Video Berhasil Diupdate!" : "Video Berhasil Diunggah!");
          router.push('/edukasi'); 
        }, 500);
      } else {
        alert("Gagal menyimpan data");
      }
    } catch (err) { alert("Error: " + err.message); } 
    finally { setIsUploading(false); }
  };

  return (
    <div className={styles.card}>
      
      {/* HEADER INFO: HANYA TAMPIL JIKA BUKAN MODE EDIT */}
      {!isEditMode && (
        <div className={styles.videoHeader}>
          <div className={styles.videoIcon}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
          <div className={styles.videoMeta}>
            <h3 className={styles.fileName}>{fileName}</h3>
            <p className={styles.fileDetails}>Durasi: --:-- &nbsp;&nbsp; Ukuran: {fileSizeTotal}MB</p>
            
            <div className={styles.progressContainer}>
              <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
              <div className={styles.progressText}>
                <span>{uploadedSize}MB / {fileSizeTotal}MB</span>
                <span>{Math.floor(progress)}%</span>
              </div>
            </div>
            
            <div className={styles.lightningIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
            </div>
          </div>
        </div>
      )}

      {/* JUDUL HALAMAN SESUAI MODE */}
      <h2 className={styles.sectionTitle}>
        {isEditMode ? "Edit Informasi Video" : "Informasi Dasar"}
      </h2>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Judul</label>
        <div className={styles.inputWrapper}>
          <input type="text" placeholder="Masukkan Judul..." className={styles.textInput} value={judul} onChange={handleJudulChange} />
          <span className={`${styles.counter} ${styles.counterInput}`}>{judul.length}/100</span>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Deskripsi</label>
        <div className={styles.inputWrapper}>
          <textarea placeholder="Masukkan Deskripsi..." className={styles.textArea} value={deskripsi} onChange={handleDeskripsiChange} />
          <span className={`${styles.counter} ${styles.counterArea}`}>{deskripsi.length}/2000</span>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Sampul</label>
        <label className={styles.coverUploadBox}>
          <input type="file" style={{display:'none'}} accept="image/*" onChange={handleSampulChange} />
          {sampul ? (
             <img src={sampul} alt="Preview" className={styles.coverPreview} />
          ) : (
            <div className={styles.uploadPlaceholder}>
              <p style={{margin:0, fontWeight:600}}>Unggah Sampul</p>
            </div>
          )}
        </label>
      </div>

      <div className={styles.actionButtons}>
        <button className={styles.btnBatal} onClick={() => router.back()}>Batal</button>
        <button className={styles.btnUnggah} onClick={handleSubmit} disabled={isUploading} style={{ opacity: isUploading ? 0.7 : 1 }}>
          {isUploading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Unggah')}
        </button>
      </div>

    </div>
  );
}

export default function EditVideoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className={styles.page}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/edukasi" />
      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <Suspense fallback={<p style={{padding: 40, textAlign:'center'}}>Memuat...</p>}>
          <EditVideoContent />
        </Suspense>
      </main>
    </div>
  );
}