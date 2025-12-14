"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import styles from './Upload.module.css';

// --- BAGIAN ISI KONTEN (UI ASLI ANDA + LOGIKA BARU) ---
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
  const fileName = searchParams.get('name') || "Video Baru";
  const fileSizeTotal = parseFloat(searchParams.get('size')) || 0;

  // Form State
  const [judul, setJudul] = useState(isEditMode ? editTitle : "");
  const [deskripsi, setDeskripsi] = useState(isEditMode ? editDesc : "");
  
  // Thumbnail
  const [sampul, setSampul] = useState(isEditMode ? editThumb : null); // Preview
  const [sampulFile, setSampulFile] = useState(null); // File baru
  
  // STATE BARU: Untuk menyimpan Video Base64 yang diambil dari halaman depan
  const [videoBase64, setVideoBase64] = useState("");

  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false); 

  // 1. LOGIKA BARU: AMBIL VIDEO DARI LOCALSTORAGE
  useEffect(() => {
    if (!isEditMode) {
        // Ambil data video yang dikirim dari halaman depan
        const tempVideo = localStorage.getItem('tempVideoUpload');
        if (tempVideo) {
            setVideoBase64(tempVideo);
        }
    }
  }, [isEditMode]);

  // 2. LOGIKA LAMA: SIMULASI PROGRESS BAR (UI KESUKAAN ANDA)
  useEffect(() => {
    if (isEditMode) return; 

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

  // Handlers UI
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

  // --- HANDLE SUBMIT (LOGIKA DIGABUNG) ---
  const handleSubmit = async () => {
    if (!judul) { alert("Judul wajib diisi!"); return; }
    
    // Validasi tambahan: Pastikan video ada jika upload baru
    if (!isEditMode && !videoBase64) {
        alert("Gagal memuat file video dari memory. Silakan kembali ke halaman sebelumnya dan pilih file lagi.");
        return;
    }

    setIsUploading(true);
    
    // 1. Cek Thumbnail (Logic Asli Anda)
    let finalThumbnail = sampul; 
    
    if (sampulFile) {
      const uploadedLink = await uploadToImgBB(sampulFile);
      if (uploadedLink) finalThumbnail = uploadedLink;
    } else if (!isEditMode && !sampul) {
      finalThumbnail = "https://i.ibb.co/1fYKT5sb/b92bb4c90cef.jpg";
    }

    // 2. Siapkan Data Payload (DITAMBAH FIELD 'LINK')
    const payload = {
      judul: judul,
      isi: deskripsi,
      kategori: "video",
      thumbnail: finalThumbnail,
      link: isEditMode ? undefined : videoBase64 // Kirim Base64 hanya jika upload baru
    };

    // 3. Tentukan URL & Method
    const url = isEditMode ? `/api/edukasi/${editId}` : '/api/edukasi';
    const method = isEditMode ? 'PUT' : 'POST';

    if (!isEditMode) setProgress(100);

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Bersihkan storage setelah sukses
        localStorage.removeItem('tempVideoUpload');
        localStorage.removeItem('tempVideoName');
        localStorage.removeItem('tempVideoSize');

        setTimeout(() => {
          alert(isEditMode ? "Video Berhasil Diupdate!" : "Video Berhasil Diunggah!");
          router.push('/edukasi'); 
        }, 500);
      } else {
        alert("Gagal menyimpan data. Pastikan ukuran file video < 4.5MB.");
      }
    } catch (err) { alert("Error: " + err.message); } 
    finally { setIsUploading(false); }
  };

  return (
    <div className={styles.card}>
      
      {/* TAMPILAN HEADER (UI ASLI ANDA) */}
      {!isEditMode && (
        <div className={styles.videoHeader}>
          <div className={styles.videoIcon}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
          <div className={styles.videoMeta}>
            <h3 className={styles.fileName}>{fileName}</h3>
            <p className={styles.fileDetails}>Ukuran: {fileSizeTotal}MB (Siap Upload)</p>
            
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

// --- BAGIAN WRAPPER (WAJIB ADA UNTUK MENGATASI ERROR VERCEL) ---
export default function EditVideoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className={styles.page}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/edukasi" />
      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        
        {/* Suspense Pembungkus (Agar tidak error build 'missing-suspense') */}
        <Suspense fallback={<p style={{padding: 40, textAlign:'center'}}>Memuat Form...</p>}>
          <EditVideoContent />
        </Suspense>

      </main>
    </div>
  );
}