// src/components/Sidebar.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const navItems = [
  { name: 'Laporan Masyarakat', href: '/app', icon: '/oui_nav-reports.png' },
  { name: 'Laporan Darurat', href: '/darurat', icon: '/Phone call.png' },
  { name: 'Database Pengguna', href: '/pengguna', icon: '/Database.png' },
  { name: 'Monitoring Sensor', href: '/monitoring', icon: '/Vector (1).png' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();

  return (
    <>
      <div className={styles.fixedLogo}>
        <img src="/logo_kecil.png" alt="Logo" className="w-12 h-12" />
      </div>

      <aside className={`${styles.sidebar} ${isOpen ? '' : styles.collapsed}`}>
        <div className={`${styles.header} ${styles.alignLeft}`}>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={styles.menuButton}
            aria-label="Toggle sidebar"
          >
            <svg className={styles.hamburgerIcon} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {isOpen ? (
                <path d="M18 6L6 18M6 6L18 18" />
              ) : (
                <path d="M3 12H21M3 6H21M3 18H21" />
              )}
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={styles.navLink}
              >
                <div 
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  title={!isOpen ? item.name : ''}
                >
                  <div className={`${styles.iconBox} ${isActive ? styles.activeIcon : ''}`}>
                    <img 
                      src={item.icon} 
                      alt={item.name} 
                      className={styles.iconImg}
                    />
                  </div>
                  {isOpen && (
                    <span className={`${styles.label} ${isActive ? styles.activeLabel : ''}`}>
                      {item.name}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className={styles.bottom}>
          <button className={styles.logout} title={!isOpen ? 'Log Out' : ''}>
            <img src="/Log out.png" alt="Logout" className={styles.logoutIcon} />
            {isOpen && <span className={styles.logoutText}>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}