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
  
  // State untuk Menu Titik Tiga (Menyimpan ID video yang menunya sedang terbuka)
  const [openMenuId, setOpenMenuId] = useState(null);

  const fileInputRef = useRef(null);
  const router = useRouter(); 

  // Load data awal
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

  // --- LOGIKA HAPUS ---
  const handleDelete = async (id) => {
    if(!confirm("Yakin ingin menghapus video ini?")) return;

    try {
      const res = await fetch(`/api/edukasi/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert("Video berhasil dihapus");
        fetchVideos(); // Refresh data setelah hapus
      }
    } catch (err) { alert("Gagal menghapus"); }
    setOpenMenuId(null);
  };

  // --- LOGIKA EDIT (Navigasi ke halaman Upload dengan Data) ---
  const handleEdit = (video) => {
    // Kirim data video lewat URL parameter
    const params = new URLSearchParams({
      mode: 'edit',
      id: video.edukasiID,
      title: video.judul,
      desc: video.isi,
      thumb: video.thumbnail || ""
    });
    router.push(`/edukasi/upload?${params.toString()}`);
  };

  // Toggle Menu (Buka/Tutup)
  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // --- UPLOAD BARU ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const fileName = encodeURIComponent(file.name);
    // Navigasi upload biasa
    router.push(`/edukasi/upload?name=${fileName}&size=${sizeMB}`);
  };

  const handleButtonClick = () => { fileInputRef.current.click(); };

  // --- SIMPAN BERITA ---
  const handleNewsSubmit = async (e) => {
    if (e.key === 'Enter') {
      if (!newsLink) return;
      try {
        const res = await fetch('/api/edukasi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ judul: "Berita Eksternal", isi: newsLink, kategori: "berita" })
        });
        if (res.ok) { alert("Link berita berhasil disimpan!"); setNewsLink(""); fetchVideos(); }
      } catch (err) { alert("Gagal simpan berita"); }
    }
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
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="video/*" onChange={handleFileChange} />
          <button className={styles.selectFileButton} onClick={handleButtonClick}>Pilih File</button>
        </div>

        {/* BERITA INPUT */}
        <div className={styles.newsInputContainer}>
           <h3 className={styles.sectionTitle}>Masukkan Berita Anda</h3>
           <input type="text" placeholder="Masukkan Link Berita lalu Tekan Enter..." className={styles.newsInput} value={newsLink} onChange={(e) => setNewsLink(e.target.value)} onKeyDown={handleNewsSubmit} />
        </div>

        {/* LIST VIDEO */}
        <div className={styles.videoSection}>
          <h3 className={styles.sectionTitle}>Video Anda</h3>
          <div className={styles.videoGrid}>
            {loading && <p>Memuat...</p>}
            {!loading && videos.length === 0 && <p style={{color:'#999'}}>Belum ada video.</p>}
            
            {videos.map((video) => (
              <div key={video.edukasiID} className={styles.videoCard}>
                
                {/* TOMBOL TITIK TIGA */}
                <button className={styles.menuButton} onClick={() => toggleMenu(video.edukasiID)}>
                  ⋮
                </button>

                {/* MENU DROPDOWN (Hanya muncul jika ID cocok) */}
                {openMenuId === video.edukasiID && (
                  <div className={styles.menuDropdown} onMouseLeave={() => setOpenMenuId(null)}>
                    <button className={styles.menuItem} onClick={() => handleEdit(video)}>Edit</button>
                    <button className={`${styles.menuItem} ${styles.deleteItem}`} onClick={() => handleDelete(video.edukasiID)}>Hapus</button>
                  </div>
                )}

                <div className={styles.thumbnailPlaceholder}>
                  {video.thumbnail ? (
                    <img 
                      src={video.thumbnail} 
                      alt={video.judul} 
                      className={styles.thumbnailImage} 
                      // --- PERBAIKAN DISINI ---
                      // Menggunakan placehold.co yang TIDAK diblokir di Indonesia
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = "https://placehold.co/600x400/png?text=Thumbnail+Tidak+Tersedia"; 
                      }} 
                    />
                  ) : (
                    // Jika data thumbnail NULL dari awal
                    <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#eee'}}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className={styles.videoInfo}>
                  <p className={styles.videoTitle}>{video.judul}</p>
                  <p style={{fontSize: '12px', color:'#777', marginTop: '5px'}}>
                    {new Date(video.tanggalPublikasi).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}