"use client";

import Link from 'next/link';
import { useState } from 'react';
import styles from './Sidebar.module.css';

const navItems = [
  { name: 'Laporan Manual', href: '/app', icon: '/oui_nav-reports.png' },
  { name: 'Laporan Darurat', href: '/darurat', icon: '/Phone call.png' },     // ← Sudah benar: /darurat
  { name: 'Database Pengguna', href: '/users', icon: '/Database.png' },
  { name: 'Monitoring Sensor', href: '/monitoring', icon: '/Vector (1).png' },
];

export default function Sidebar({ 
  isOpen: controlledOpen, 
  setIsOpen: setControlledOpen,
  activePage                                            // ← Terima props ini
}) {
  const [internalOpen, setInternalOpen] = useState(true);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen || setInternalOpen;

  // Gunakan activePage dari props, fallback ke pathname
  const currentPath = activePage || (typeof window !== 'undefined' ? window.location.pathname : '/app');

  return (
    <>
      <div className={styles.fixedLogo}>
        <img src="/logo_kecil.png" alt="Logo" />
      </div>

      <aside className={`${styles.sidebar} ${isOpen ? '' : styles.collapsed}`}>
        <div className={`${styles.header} ${styles.alignLeft}`}>
          <button onClick={() => setIsOpen(!isOpen)} className={styles.menuButton}>
            <svg className={styles.hamburgerIcon} width="24" height="24" viewBox="0 0 24 24" fill="none">
              {isOpen ? (
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = item.href === currentPath;

            return isActive ? (
              <div
                key={item.name}
                className={`${styles.navItem} ${styles.active}`}
                title={!isOpen ? item.name : ''}
              >
                <div className={styles.iconBox}>
                  <img src={item.icon} alt="" className={styles.iconImg} />
                </div>
                {isOpen && <span className={styles.label}>{item.name}</span>}
              </div>
            ) : (
              <Link href={item.href} key={item.name} className={styles.navLink}>
                <div className={styles.navItem} title={!isOpen ? item.name : ''}>
                  <div className={styles.iconBox}>
                    <img src={item.icon} alt="" className={styles.iconImg} />
                  </div>
                  {isOpen && <span className={styles.label}>{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className={styles.bottom}>
          <button className={styles.logout} title={!isOpen ? 'Log Out' : ''}>
            <img src="/Log out.png" alt="" className={styles.logoutIcon} />
            {isOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}