'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.container}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className={`${styles.content} ${isOpen ? styles.expanded : styles.collapsed}`}>
        {children}
      </main>
    </div>
  );
}
