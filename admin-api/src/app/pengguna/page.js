"use client";

import styles from './pengguna.module.css';
import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function DatabasePengguna() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/pengguna')
      .then(r => r.json())
      .then(data => setUsers(data.users || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => 
    u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/pengguna" />

      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" alt="Search" width={20} height={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari nama atau email pengguna..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <button className={styles.uploadButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14m-7-7h14" />
          </svg>
          <span>Tambah Pengguna</span>
        </button>
      </div>

      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <header className={styles.header}>
          <h2>Database Pengguna</h2>
        </header>

        {loading ? (
          <div className={styles.emptyState}><p>Memuat data...</p></div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}><p>Belum ada pengguna</p></div>
        ) : (
          <div className={styles.userGrid}>
            {filtered.map(user => (
              <div key={user.uid} style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <img src={user.foto || '/logo_kecil.png'} alt="" width={64} height={64} style={{ borderRadius: '50%' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '700' }}>{user.nama}</h3>
                    <p style={{ margin: '4px 0 0', color: '#666' }}>{user.email}</p>
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: '#555', marginBottom: '20px' }}>
                  <p><strong>Dibuat:</strong> {user.dibuat}</p>
                  <p><strong>Login terakhir:</strong> {user.terakhirLogin}</p>
                  <p><strong>Status:</strong> <span style={{ color: user.status === 'Aktif' ? 'green' : 'red', fontWeight: 'bold' }}>{user.status}</span></p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ flex: 1, padding: '12px', background: '#facc15', color: 'black', border: 'none', borderRadius: '10px', fontWeight: '600' }}>Edit</button>
                  <button style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600' }}>Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}