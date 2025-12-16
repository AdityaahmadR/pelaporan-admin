"use client";

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import styles from './Edukasi.module.css';
import { useRouter } from 'next/navigation'; 

export default function EdukasiPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [videos, setVideos] = useState([]);
  const [newsLink, setNewsLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const fileInputRef = useRef(null);
  const router = useRouter(); 

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/edukasi');
      const data = await res.json();
      console.log("Data Video:", data);
      if (Array.isArray(data)) setVideos(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if(!confirm("Yakin ingin menghapus video ini?")) return;
    try {
      const res = await fetch(`/api/edukasi/${id}`, { method: 'DELETE' });
      if (res.ok) { alert("Video berhasil dihapus"); fetchVideos(); }
    } catch (err) { alert("Gagal menghapus"); }
    setOpenMenuId(null);
  };

  const handleEdit = (video) => {
    // Mode Edit: Kirim data yang ada
    // PENTING: Kita TIDAK mengirim video base64 lewat URL karena terlalu panjang.
    const params = new URLSearchParams({
      mode: 'edit',
      id: video.edukasiID,
      title: video.judul,
      desc: video.isi,
      thumb: video.thumbnail || ""
    });
    router.push(`/edukasi/upload?${params.toString()}`);
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // --- LOGIKA VALIDASI FILE 4.5 MB ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limitasi Vercel Serverless Function Payload (4.5 MB)
    const maxSize = 4.5 * 1024 * 1024; 
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

    if (file.size > maxSize) {
      alert(`⚠️ File terlalu besar (${sizeMB} MB).\nBatas maksimal prototype Vercel adalah 4.5 MB.\nSilakan kompres video atau potong durasinya.`);
      e.target.value = null; // Reset input
      return;
    }

    // Jika aman, kita simpan file sementara di localStorage agar bisa diambil di halaman upload
    // (Karena kita tidak bisa kirim file object lewat URL)
    const reader = new FileReader();
    reader.onload = function(event) {
        // Simpan Base64 video ke LocalStorage sementara
        try {
            localStorage.setItem('tempVideoUpload', event.target.result);
            localStorage.setItem('tempVideoName', file.name);
            localStorage.setItem('tempVideoSize', sizeMB);
            
            const fileName = encodeURIComponent(file.name);
            router.push(`/edukasi/upload?name=${fileName}&size=${sizeMB}&mode=new`);
        } catch (err) {
            alert("Gagal memproses file (Quota LocalStorage Penuh). Coba file lebih kecil.");
        }
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => { fileInputRef.current.click(); };

  const handleNewsSubmit = async (e) => {
    if (e.key === 'Enter') {
      if (!newsLink) return;
      try {
        const res = await fetch('/api/edukasi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ judul: "Berita Eksternal", isi: newsLink, kategori: "berita" })
        });
        if (res.ok) { alert("Berita disimpan!"); setNewsLink(""); fetchVideos(); }
      } catch (err) { alert("Gagal simpan berita"); }
    }
  };

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/edukasi" />

      <main className={styles.content}>
        
        {/* UPLOAD BOX */}
        <div className={styles.uploadContainer}>
           <div className={styles.uploadIcon}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <h2 className={styles.uploadText}>Masukkan video anda untuk mengunggah</h2>
          <p style={{fontSize:'12px', color:'#d71c1c', marginTop:'-10px', fontWeight:'bold'}}>
            *Maksimal 4.5 MB (Limit Prototype)
          </p>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="video/*" onChange={handleFileChange} />
          <button className={styles.selectFileButton} onClick={handleButtonClick}>Pilih File</button>
        </div>

        {/* BERITA & LIST VIDEO (Kode sama seperti sebelumnya) */}
        <div className={styles.newsInputContainer}>
           <h3 className={styles.sectionTitle}>Masukkan Berita Anda</h3>
           <input type="text" placeholder="Link Berita..." className={styles.newsInput} value={newsLink} onChange={(e) => setNewsLink(e.target.value)} onKeyDown={handleNewsSubmit} />
        </div>

        <div className={styles.videoSection}>
          <h3 className={styles.sectionTitle}>Video Anda</h3>
          <div className={styles.videoGrid}>
            {!loading && videos.length === 0 && <p style={{color:'#999'}}>Belum ada video.</p>}
            
            {videos.map((video) => (
              <div key={video.edukasiID} className={styles.videoCard}>
                <button className={styles.menuButton} onClick={() => toggleMenu(video.edukasiID)}>⋮</button>
                {openMenuId === video.edukasiID && (
                  <div className={styles.menuDropdown} onMouseLeave={() => setOpenMenuId(null)}>
                    <button className={styles.menuItem} onClick={() => handleEdit(video)}>Edit</button>
                    <button className={`${styles.menuItem} ${styles.deleteItem}`} onClick={() => handleDelete(video.edukasiID)}>Hapus</button>
                  </div>
                )}

                <div className={styles.thumbnailPlaceholder}>
                  {/* TAMPILKAN VIDEO JIKA ADA LINK DATA BASE64 */}
                  {video.link && video.link.startsWith('data:video') ? (
                     <video src={video.link} controls className={styles.thumbnailImage} style={{objectFit:'cover'}} />
                  ) : (
                      // JIKA TIDAK ADA VIDEO, TAMPILKAN THUMBNAIL GAMBAR / FALLBACK
                      video.thumbnail && !imageErrors[video.edukasiID] ? (
                        <img src={video.thumbnail} alt={video.judul} className={styles.thumbnailImage} onError={() => handleImageError(video.edukasiID)} />
                      ) : (
                        <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f0f0', color:'#888', flexDirection:'column'}}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                          </svg>
                          <span style={{fontSize:'12px', marginTop:'5px'}}>Video</span>
                        </div>
                      )
                  )}
                </div>
                <div className={styles.videoInfo}>
                  <p className={styles.videoTitle}>{video.judul}</p>
                  <p style={{fontSize: '12px', color:'#777'}}>{new Date(video.tanggalPublikasi).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}