"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import styles from './Upload.module.css';

// --- BAGIAN ISI KONTEN ---
function EditVideoContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); 

  // --- CEK MODE ---
  const isEditMode = searchParams.get('mode') === 'edit';
  const editId = searchParams.get('id');
  const editTitle = searchParams.get('title') || "";
  const editDesc = searchParams.get('desc') || "";
  const editThumb = searchParams.get('thumb') || "";

  // Data File Baru
  const fileName = searchParams.get('name') || "Video Baru";
  const fileSizeTotal = parseFloat(searchParams.get('size')) || 0;

  // Form State
  const [judul, setJudul] = useState(isEditMode ? editTitle : "");
  const [deskripsi, setDeskripsi] = useState(isEditMode ? editDesc : "");
  
  // Thumbnail State (Akan berisi Base64 String)
  const [sampul, setSampul] = useState(isEditMode ? editThumb : null); 
  
  // Video Base64 State
  const [videoBase64, setVideoBase64] = useState("");

  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false); 

  // 1. AMBIL VIDEO DARI LOCALSTORAGE
  useEffect(() => {
    if (!isEditMode) {
        const tempVideo = localStorage.getItem('tempVideoUpload');
        if (tempVideo) {
            setVideoBase64(tempVideo);
        }
    }
  }, [isEditMode]);

  // 2. SIMULASI PROGRESS BAR
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

  // --- LOGIKA BARU: GAMBAR KE BASE64 (MURNI) ---
  const handleSampulChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi: Maksimal 1 MB agar database tidak berat
      if (file.size > 1 * 1024 * 1024) {
        alert("Ukuran gambar sampul maksimal 1 MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        // Simpan hasil konversi (Base64 text) ke state
        // Ini akan langsung dikirim ke database nanti
        setSampul(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- HANDLE SUBMIT ---
  const handleSubmit = async () => {
    if (!judul) { alert("Judul wajib diisi!"); return; }
    
    // Validasi video untuk upload baru
    if (!isEditMode && !videoBase64) {
        alert("Gagal memuat file video. Silakan kembali dan pilih file lagi.");
        return;
    }

    setIsUploading(true);
    
    // Siapkan Data Payload
    // KITA TIDAK LAGI MENGGUNAKAN IMGBB
    // Kita kirim data 'sampul' apa adanya (Base64 atau Link lama)
    const payload = {
      judul: judul,
      isi: deskripsi,
      kategori: "video",
      thumbnail: sampul, // Base64 Text
      link: isEditMode ? undefined : videoBase64
    };

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
        // Bersihkan memory
        localStorage.removeItem('tempVideoUpload');
        localStorage.removeItem('tempVideoName');
        localStorage.removeItem('tempVideoSize');

        setTimeout(() => {
          alert(isEditMode ? "Video Berhasil Diupdate!" : "Video Berhasil Diunggah!");
          router.push('/edukasi'); 
        }, 500);
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (err) { alert("Error: " + err.message); } 
    finally { setIsUploading(false); }
  };

  return (
    <div className={styles.card}>
      
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
          </div>
        </div>
      )}

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
        <label className={styles.label}>Sampul (Max 1MB)</label>
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

// --- BAGIAN WRAPPER ---
export default function EditVideoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className={styles.page}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/edukasi" />
      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <Suspense fallback={<p style={{padding: 40, textAlign:'center'}}>Memuat Form...</p>}>
          <EditVideoContent />
        </Suspense>
      </main>
    </div>
  );
}