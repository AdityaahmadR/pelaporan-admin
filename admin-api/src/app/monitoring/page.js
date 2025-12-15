"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import styles from './monitoring.module.css';
import { dbIoT } from '@/lib/firebaseIoT'; // Import Config IoT Anda
import { ref, onValue, off } from "firebase/database";

export default function MonitoringPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  // State Data Sensor (Default: Aman/Normal)
  const [sensorData, setSensorData] = useState({
    api: 0,
    asap: 0,
    kelembaban: 0, 
    suhu: 0,
    esp32cam: 0
  });

  // State Status Global (NORMAL / BAHAYA)
  const [globalStatus, setGlobalStatus] = useState("NORMAL");

  useEffect(() => {
    // Path Root '/' untuk membaca semua data ESP32
    const sensorRef = ref(dbIoT, '/'); 
    
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // --- MAPPING DATA (Sesuaikan nama variabel dari ESP32 di sini) ---
        // Contoh: jika di firebase namanya "fire_status", ganti data.fire_status
        const newData = {
            api: data.api || data.fire || 0,
            asap: data.asap || data.smoke || 0,
            kelembaban: data.kelembaban || data.hum || 0,
            suhu: data.suhu || data.temp || 0,
            esp32cam: data.cam_fire || 0 // Asumsi variable kamera
        };

        setSensorData(newData);

        // --- LOGIKA STATUS UTAMA ---
        // Jika ada Api ATAU Asap Bahaya ATAU Suhu > 50 -> BAHAYA
        if (newData.api == 1 || newData.asap == 1 || newData.suhu > 50) {
            setGlobalStatus("BAHAYA");
        } else {
            setGlobalStatus("NORMAL");
        }
      }
    });

    return () => off(sensorRef);
  }, []);

  // Helper untuk teks status (Biar kodenya rapi)
  const getStatusText = (val, type) => {
    if (type === 'api') return val == 1 ? "Terdeteksi" : "Tidak Terdeteksi";
    if (type === 'bahaya') return val == 1 ? "Bahaya" : "Normal";
    if (type === 'suhu') return val > 50 ? "Bahaya" : "Normal"; 
    return "Normal";
  };

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`}>
      
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/monitoring" />

      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" alt="Search" width={20} height={20} className={styles.searchIcon} />
            <input type="text" placeholder="Search Sensor..." className={styles.searchInput} />
          </div>
        </div>
        <button className={styles.uploadButton} onClick={() => router.push('/edukasi')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Upload</span>
        </button>
      </div>

      <main className={`${styles.content} ${!sidebarOpen ? styles.collapsed : ''}`}>
        
        <header className={styles.header}>
          <h2>Monitoring Sensor</h2>
        </header>

        <div className={styles.dashboardGrid}>
            
            {/* 1. KARTU STATUS UTAMA (MERAH & PUTIH) */}
            <div className={styles.mainStatusCard}>
                <div className={styles.statusLabelBox}>
                    <span className={styles.statusLabelText}>
                        STATUS<br/>KEADAAN<br/>LOKASI
                    </span>
                </div>
                <div className={styles.statusValueBox}>
                    <span className={`${styles.statusValueText} ${globalStatus === 'BAHAYA' ? styles.danger : ''}`}>
                        {globalStatus}
                    </span>
                </div>
            </div>

            {/* 2. GRID 5 SENSOR */}
            <div className={styles.sensorGrid}>

                {/* --- 1. SENSOR API --- */}
                <div className={styles.sensorItem}>
                    <div className={styles.sensorNameBox}>
                        <span className={styles.sensorNameText}>SENSOR<br/>API</span>
                    </div>
                    <div className={styles.sensorDetailBox}>
                        <div className={styles.activeIndicator}>
                            Aktif <span className={styles.dot}></span>
                        </div>
                        <div className={styles.sensorStatusText}>
                            Status Api: <span className={styles.statusHighlight}>{getStatusText(sensorData.api, 'api')}</span>
                        </div>
                    </div>
                </div>

                {/* --- 2. SENSOR ASAP --- */}
                <div className={styles.sensorItem}>
                    <div className={styles.sensorNameBox}>
                        <span className={styles.sensorNameText}>SENSOR<br/>ASAP</span>
                    </div>
                    <div className={styles.sensorDetailBox}>
                        <div className={styles.activeIndicator}>
                            Aktif <span className={styles.dot}></span>
                        </div>
                        <div className={styles.sensorStatusText}>
                            Status Asap: <span className={styles.statusHighlight}>{getStatusText(sensorData.asap, 'bahaya')}</span>
                        </div>
                    </div>
                </div>

                {/* --- 3. SENSOR KELEMBAPAN --- */}
                <div className={styles.sensorItem}>
                    <div className={styles.sensorNameBox}>
                        <span className={styles.sensorNameText}>SENSOR<br/>KELEMBAPAN</span>
                    </div>
                    <div className={styles.sensorDetailBox}>
                         <div className={styles.activeIndicator}>
                            Aktif <span className={styles.dot}></span>
                        </div>
                        <div className={styles.sensorStatusText}>
                            Status Kelembapan: <span className={styles.statusHighlight}>{getStatusText(sensorData.kelembaban, 'bahaya')}</span>
                        </div>
                    </div>
                </div>

                {/* --- 4. SENSOR SUHU --- */}
                <div className={styles.sensorItem}>
                    <div className={styles.sensorNameBox}>
                        <span className={styles.sensorNameText}>SENSOR<br/>SUHU</span>
                    </div>
                    <div className={styles.sensorDetailBox}>
                         <div className={styles.activeIndicator}>
                            Aktif <span className={styles.dot}></span>
                        </div>
                        <div className={styles.sensorStatusText}>
                            Status Suhu: <span className={styles.statusHighlight}>{getStatusText(sensorData.suhu, 'suhu')}</span>
                        </div>
                    </div>
                </div>

                 {/* --- 5. ESP32 CAM --- */}
                 <div className={styles.sensorItem}>
                    <div className={styles.sensorNameBox}>
                        <span className={styles.sensorNameText}>ESP32<br/>CAM</span>
                    </div>
                    <div className={styles.sensorDetailBox}>
                         <div className={styles.activeIndicator}>
                            Aktif <span className={styles.dot}></span>
                        </div>
                        <div className={styles.sensorStatusText}>
                            Status Api: <span className={styles.statusHighlight}>{getStatusText(sensorData.esp32cam, 'api')}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>

      </main>
    </div>
  );
}