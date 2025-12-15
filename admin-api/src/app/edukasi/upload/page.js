"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import styles from './Upload.module.css';

// --- BAGIAN ISI KONTEN ---
function EditVideoContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); 

  // --- 1. SETUP VARIABEL DARI URL ---
  const isEditMode = searchParams.get('mode') === 'edit';
  const editId = searchParams.get('id');
  const editTitle = searchParams.get('title') || "";
  const editDesc = searchParams.get('desc') || "";
  const editThumb = searchParams.get('thumb') || "";

  // Data File Baru (Dari Halaman Depan)
  const fileName = searchParams.get('name') || "Video Baru";
  const fileSizeTotal = parseFloat(searchParams.get('size')) || 0;

  // --- 2. STATE ---
  const [judul, setJudul] = useState(isEditMode ? editTitle : "");
  const [deskripsi, setDeskripsi] = useState(isEditMode ? editDesc : "");
  
  // Thumbnail (Preview & File)
  const [sampul, setSampul] = useState(isEditMode ? editThumb : null); 
  const [sampulFile, setSampulFile] = useState(null); 
  
  // Video Base64 (Disimpan sementara)
  const [videoBase64, setVideoBase64] = useState("");

  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false); 
  const [uploadStatus, setUploadStatus] = useState(""); // Info status upload

  // --- 3. AMBIL VIDEO DARI MEMORY BROWSER ---
  useEffect(() => {
    if (!isEditMode) {
        const tempVideo = localStorage.getItem('tempVideoUpload');
        if (tempVideo) {
            setVideoBase64(tempVideo);
        }
    }
  }, [isEditMode]);

  // --- 4. ANIMASI PROGRESS BAR ---
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

  // --- 5. HANDLERS INPUT ---
  const handleJudulChange = (e) => { if (e.target.value.length <= 100) setJudul(e.target.value); };
  const handleDeskripsiChange = (e) => { if (e.target.value.length <= 2000) setDeskripsi(e.target.value); };

  const handleSampulChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Buat preview lokal agar user langsung lihat
      setSampul(URL.createObjectURL(file));
      setSampulFile(file);
    }
  };

  // --- 6. FUNGSI UPLOAD KE IMGBB (DENGAN API KEY ANDA) ---
  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    // API Key Anda
    const API_KEY = "0416af70555c12b73e1f822d3603c165"; 
    
    try {
      setUploadStatus("Mengupload gambar ke ImgBB...");
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, { 
          method: "POST", 
          body: formData 
      });
      const data = await res.json();
      
      if (data.success) {
          console.log("ImgBB Success:", data.data.url);
          return data.data.url; // Kembalikan Link URL
      } else {
          throw new Error("ImgBB API Error");
      }
    } catch (error) {
      console.error("Gagal ke ImgBB:", error);
      return null; // Gagal upload
    }
  };

  // --- 7. FUNGSI CONVERT FILE KE BASE64 (CADANGAN) ---
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // --- 8. TOMBOL SIMPAN DITEKAN ---
  const handleSubmit = async () => {
    if (!judul) { alert("Judul wajib diisi!"); return; }
    
    if (!isEditMode && !videoBase64) {
        alert("Gagal memuat file video. Silakan pilih file lagi.");
        return;
    }

    setIsUploading(true);
    setUploadStatus("Memproses Thumbnail...");
    
    // --- LOGIKA THUMBNAIL HYBRID ---
    let finalThumbnail = sampul; 

    // Jika user memilih file thumbnail baru
    if (sampulFile) {
        // COBA 1: Upload ke ImgBB
        const imgbbLink = await uploadToImgBB(sampulFile);
        
        if (imgbbLink) {
            // Jika sukses, pakai Link ImgBB
            finalThumbnail = imgbbLink;
            setUploadStatus("Gambar tersimpan di ImgBB.");
        } else {
            // Jika GAGAL (Diblokir/Error), pakai Base64 (Simpan ke Database)
            setUploadStatus("ImgBB Gagal/Diblokir. Menyimpan ke Database lokal...");
            try {
                const base64Img = await fileToBase64(sampulFile);
                finalThumbnail = base64Img;
            } catch (err) {
                console.error("Gagal konversi base64");
            }
        }
    } 
    // Jika upload baru tapi tidak pilih gambar -> Pakai Default
    else if (!isEditMode && !sampul) {
      finalThumbnail = "https://placehold.co/600x400/png?text=No+Thumbnail"; 
    }

    // --- SIAPKAN DATA ---
    const payload = {
      judul: judul,
      isi: deskripsi,
      kategori: "video",
      thumbnail: finalThumbnail,
      link: isEditMode ? undefined : videoBase64
    };

    const url = isEditMode ? `/api/edukasi/${editId}` : '/api/edukasi';
    const method = isEditMode ? 'PUT' : 'POST';

    if (!isEditMode) setProgress(100);
    setUploadStatus("Menyimpan Data Video...");

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
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
    finally { 
        setIsUploading(false); 
        setUploadStatus("");
    }
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
            <p className={styles.fileDetails}>Ukuran: {fileSizeTotal}MB</p>
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
        {/* Indikator Status Upload */}
        {isUploading && <span style={{fontSize:'12px', color:'#d71c1c', marginRight:'10px', fontWeight:'bold'}}>{uploadStatus}</span>}
        
        <button className={styles.btnBatal} onClick={() => router.back()} disabled={isUploading}>Batal</button>
        <button className={styles.btnUnggah} onClick={handleSubmit} disabled={isUploading} style={{ opacity: isUploading ? 0.7 : 1 }}>
          {isUploading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Unggah')}
        </button>
      </div>

    </div>
  );
}

// --- BAGIAN WRAPPER (WAJIB ADA) ---
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