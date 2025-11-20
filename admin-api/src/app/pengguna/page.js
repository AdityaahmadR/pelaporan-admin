"use client";

import styles from '../pengguna/pengguna.module.css';
import Sidebar from '../../components/Sidebar';
import { useState } from 'react';
import Image from 'next/image';

export default function DatabasePengguna() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('masyarakat');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const masyarakatRef = useRef(null);
  const petugasRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  // DUMMY DATA — NANTI GANTI DENGAN FETCH DARI API
  const [masyarakat] = useState([
    { id: 1, nama: "Aditya Ahmad", email: "adit@gmail.com", telp: "08123456789", foto: "/logo_kecil.png" },
    { id: 2, nama: "Siti Nurhaliza", email: "siti@gmail.com", telp: "08234567890", foto: "/logo_kecil.png" },
  ]);

  const [petugas] = useState([
    { id: 101, nama: "Budi Santoso", email: "budi@admin.com", telp: "08987654321", role: "Admin", foto: "/logo_kecil.png" },
    { id: 102, nama: "Rina Amelia", email: "rina@petugas.com", telp: "08765432109", role: "Petugas Lapangan", foto: "/logo_kecil.png" },
  ]);

  const data = activeTab === 'masyarakat' ? masyarakat : petugas;
  const filtered = data.filter(item =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const active = activeTab === 'masyarakat' ? masyarakatRef.current : petugasRef.current;
    if (active) {
      setIndicator({
        left: active.offsetLeft,
        width: active.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/pengguna" />

      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" alt="Search" width={20} height={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* TOMBOL TAMBAH USER — SESUAI GAMBAR */}
        <button onClick={() => setShowModal(true)} className={styles.addButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8m-4-4h8" />
          </svg>
          Tambah User
        </button>
      </div>

      {/* KONTEN */}
      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <header className={styles.header} style={{ paddingBottom: '32px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '48px', paddingLeft: '12px', position: 'relative' }}>
            <h2 ref={masyarakatRef} onClick={() => setActiveTab('masyarakat')}
              style={{ margin: 0, fontSize: '26px', fontWeight: activeTab === 'masyarakat' ? '800' : '700', color: '#212529', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', zIndex: 10 }}>
              Database Masyarakat
            </h2>
            <h2 ref={petugasRef} onClick={() => setActiveTab('petugas')}
              style={{ margin: 0, fontSize: '26px', fontWeight: activeTab === 'petugas' ? '800' : '700', color: '#212529', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', zIndex: 10 }}>
              Database Petugas
            </h2>
            <div style={{
              position: 'absolute', bottom: '10px', left: `${indicator.left}px`, width: `${indicator.width}px`,
              height: '4px', background: '#d71c1c', borderRadius: '2px', transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 1
            }} />
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '1px', background: '#e5e7eb' }} />
        </header>

        {/* GRID USER */}
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Tidak ada data {activeTab === 'masyarakat' ? 'masyarakat' : 'petugas'} ditemukan</p>
          </div>
        ) : (
          <div className={styles.userGrid}>
            {filtered.map(user => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.cardHeader}>
                  <img src={user.foto} alt={user.nama} className={styles.avatar} />
                  <div>
                    <h3>{user.nama}</h3>
                    <p>{user.email}</p>
                    {user.telp && <p className={styles.telp}>{user.telp}</p>}
                    {user.role && <span className={styles.role}>{user.role}</span>}
                  </div>
                </div>
                <button className={styles.deleteBtn}>
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL TAMBAH USER — NANTI KITA BIKIN */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Tambah {activeTab === 'masyarakat' ? 'Masyarakat' : 'Petugas'}</h2>
            <button onClick={() => setShowModal(false)} className={styles.closeModal}>×</button>
            {/* Form nanti di sini */}
            <p style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>Form coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}