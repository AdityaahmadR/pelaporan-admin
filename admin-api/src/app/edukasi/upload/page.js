"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import styles from './upload.module.css';

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const mode = searchParams.get('mode') || 'new';
  const id = searchParams.get('id');

  const [formData, setFormData] = useState({
    judul: searchParams.get('title') || '',
    isi: searchParams.get('desc') || '',
    thumbnail: searchParams.get('thumb') || '',
    link: '' // Akan diisi video Base64
  });

  const [videoFile, setVideoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Jika mode baru, ambil video dari localStorage (hasil pilih file di halaman depan)
    if (mode === 'new') {
        const tempVideo = localStorage.getItem('tempVideoUpload');
        const tempName = localStorage.getItem('tempVideoName');
        const tempSize = localStorage.getItem('tempVideoSize');

        if (tempVideo) {
            setVideoFile({ name: tempName, size: tempSize });
            setFormData(prev => ({ ...prev, link: tempVideo }));
            
            // Bersihkan storage agar tidak berat
            // localStorage.removeItem('tempVideoUpload'); 
        }
    }
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = mode === 'edit' ? `/api/edukasi/${id}` : '/api/edukasi';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const payload = {
        judul: formData.judul,
        isi: formData.isi,
        thumbnail: formData.thumbnail, // ImgBB URL (jika ada)
        kategori: 'video',
        link: formData.link // INI PENTING: Data Video Base64
      };

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Gagal menyimpan. Pastikan file < 4.5MB");
      
      alert("Berhasil disimpan!");
      localStorage.removeItem('tempVideoUpload'); // Bersihkan memory
      router.push('/edukasi');

    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/edukasi" />
      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <h1 className={styles.title}>{mode === 'edit' ? 'Edit Video' : 'Upload Video'}</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          
          {/* Preview File Video */}
          <div className={styles.fileInfo}>
             <p>File Video: <b>{videoFile ? videoFile.name : (mode === 'edit' ? 'Video tersimpan di database' : 'Belum ada file')}</b></p>
             {videoFile && <p>Ukuran: {videoFile.size} MB</p>}
          </div>

          <div className={styles.inputGroup}>
            <label>Judul Video</label>
            <input 
              type="text" 
              value={formData.judul} 
              onChange={(e) => setFormData({...formData, judul: e.target.value})} 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Deskripsi</label>
            <textarea 
              rows="4"
              value={formData.isi} 
              onChange={(e) => setFormData({...formData, isi: e.target.value})} 
              required 
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={() => router.back()} className={styles.btnCancel}>Batal</button>
            <button type="submit" disabled={isSubmitting} className={styles.btnSubmit}>
              {isSubmitting ? 'Menyimpan (Loading)...' : 'Simpan Video'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}