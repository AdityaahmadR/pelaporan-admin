"use client";

import styles from './pengguna.module.css';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// INI YANG BIKIN VERCEL TAKUT PRERENDER HALAMAN INI
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DatabasePengguna() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('masyarakat');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // YANG INI SUDAH BENAR → /api/users
        const res = await fetch(`/api/users?role=${activeTab}`, { cache: 'no-store' });
        
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errText.substring(0, 200)}`);
        }
        
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Gagal fetch data:', err);
        alert('Gagal mengambil data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [activeTab]);

  const hapusUser = async (id) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    try {
      // Kamu bisa ganti ini nanti kalau mau buat API hapus terpisah
      const res = await fetch(`/api/pengguna/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.userID !== id));
        alert('User berhasil dihapus');
      } else {
        alert('Gagal menghapus user');
      }
    } catch (err) {
      alert('Error jaringan');
    }
  };

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/pengguna" />

      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" alt="Search" width={20} height={20} className={styles.searchIcon} />
            <input type="text" placeholder="Search" className={styles.searchInput} />
          </div>
        </div>
        <button className={styles.uploadButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 1-2 2H5a2 2 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Upload</span>
        </button>
      </div>

      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <header className={styles.header} style={{ paddingBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px', position: 'relative', paddingLeft: '12px' }}>
            <h2
              onClick={() => setActiveTab('masyarakat')}
              style={{
                margin: 0,
                fontSize: '26px',
                fontWeight: activeTab === 'masyarakat' ? '800' : '700',
                color: '#212529',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              Database Masyarakat
              {activeTab === 'masyarakat' && (
                <span style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '-10px',
                  height: '4px',
                  background: '#d71c1c',
                  borderRadius: '2px'
                }}></span>
              )}
            </h2>

            <h2
              onClick={() => setActiveTab('petugas')}
              style={{
                margin: 0,
                fontSize: '26px',
                fontWeight: activeTab === 'petugas' ? '800' : '700',
                color: '#212529',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              Database Petugas
              {activeTab === 'petugas' && (
                <span style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '-10px',
                  height: '4px',
                  background: '#d71c1c',
                  borderRadius: '2px'
                }}></span>
              )}
            </h2>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '1px', background: '#e5e7eb' }}></div>
        </header>

        <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Nama</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Email</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Riwayat Pelaporan</th>
                <th style={{ padding: '16px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Memuat data...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Tidak ada data {activeTab}</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.userID} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{user.nama}</td>
                    <td style={{ padding: '16px', color: '#666' }}>{user.email}</td>
                    <td style={{ padding: '16px', color: '#666' }}>{user.jumlah_laporan} Pelaporan</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        onClick={() => hapusUser(user.userID)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '8px 20px',
                          borderRadius: '50px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          background: 'transparent', border: 'none', fontSize: '18px', fontWeight: 600, color: '#666',
          display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', zIndex: 100
        }}>
          <div style={{
            width: '56px', height: '56px', background: '#e5e7eb', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#666'
          }}>+</div>
          Tambah User
        </button>
      </main>
    </div>
  );
}