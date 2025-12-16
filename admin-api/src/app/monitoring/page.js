"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import styles from './monitoring.module.css';
import { dbIoT } from '@/lib/firebaseIoT'; 
import { ref, onValue, off } from "firebase/database";

export default function MonitoringPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  // State Data Sensor
  const [sensorData, setSensorData] = useState({
    api: "SAFE",
    asap: "NORMAL",
    kelembaban: 0,
    suhu: 0,
    esp32cam: "nofire" // Default sesuai data di folder 'hasil'
  });

  // State Status Aktif Sensor
  const [sensorActive, setSensorActive] = useState({
    api: false,
    asap: false,
    kelembaban: false,
    suhu: false,
    esp32cam: false
  });

  // State Status Global
  const [globalStatus, setGlobalStatus] = useState("NORMAL");
  const [lastNotificationTime, setLastNotificationTime] = useState(0);

  // --- FUNGSI KIRIM NOTIFIKASI ---
  const sendNotification = async (type, title, message) => {
    try {
      await fetch('/api/kirim-notifikasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: 'admin', type, title, body: message })
      });
    } catch (error) { console.error('Gagal kirim notifikasi:', error); }
  };
  
  // --- FUNGSI BUAT LAPORAN OTOMATIS ---
  const createAutoReport = async (description) => {
      try {
         await fetch('/api/semua-laporan/darurat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID: 'sistem_iot', deskripsi: description, lokasi: 'Gedung Utama' })
          });
      } catch (error) { console.error("Gagal buat laporan", error); }
  }

  useEffect(() => {
    // 1. PERBAIKAN UTAMA: BACA DARI ROOT ('/')
    // Agar kita bisa mengambil folder 'fire_detection_system' DAN folder 'hasil'
    const rootRef = ref(dbIoT, '/'); 
    
    const unsubscribe = onValue(rootRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        // Ambil data dari folder masing-masing
        // Menggunakan "Optional Chaining" (?.) dan "Default Value" (|| {}) agar tidak error jika kosong
        const fds = data.fire_detection_system || {}; 
        const s = fds.sensors || {};         
        const sys = fds.system || {};        
        const hasilCam = data.hasil || {};   // <-- INI DATA KAMERA (Di luar folder system)

        // --- 2. MAPPING DATA ---
        const newData = {
            api: s.flame?.status || "SAFE",
            asap: s.mq135?.level || "NORMAL",
            kelembaban: s.humidity?.value || 0,
            suhu: s.temperature?.value || 0,
            
            // Ambil dari folder 'hasil' -> 'label' (isinya "nofire" atau "fire")
            esp32cam: hasilCam.label || "nofire" 
        };

        // --- 3. CEK STATUS AKTIF ---
        const newActiveStatus = {
          api: s.flame !== undefined,
          asap: s.mq135 !== undefined,
          kelembaban: s.humidity !== undefined,
          suhu: s.temperature !== undefined,
          
          // Kamera aktif jika folder 'hasil' ada isinya
          esp32cam: hasilCam.label !== undefined 
        };

        setSensorData(newData);
        setSensorActive(newActiveStatus);

        // --- 4. LOGIKA STATUS GLOBAL ---
        let currentStatus = sys.danger_status || "NORMAL";
        
        // Logika Tambahan: Jika Kamera mendeteksi "fire", paksa status jadi BAHAYA
        // (Berjaga-jaga jika sistem hardware belum update status global)
        if (newData.esp32cam === "fire") {
            currentStatus = "DANGER";
        }

        // Translate Status ke Bahasa Indonesia
        if (currentStatus === "SAFE") currentStatus = "NORMAL";
        if (currentStatus === "DANGER") currentStatus = "BAHAYA";

        setGlobalStatus(currentStatus);

        // --- 5. LOGIKA NOTIFIKASI ---
        const now = Date.now();
        const COOLDOWN = 5 * 60 * 1000;

        // Jika Status BAHAYA dan cooldown selesai
        if ((currentStatus === "BAHAYA" || currentStatus === "DARURAT") && (now - lastNotificationTime > COOLDOWN)) {
             const message = `Sistem mendeteksi bahaya! Status Lokasi: ${currentStatus}. Suhu: ${newData.suhu}°C. Kamera: ${newData.esp32cam === "fire" ? "Terdeteksi Api" : "Aman"}`;
             
             sendNotification('bahaya_sensor', '🔥 PERINGATAN BAHAYA!', message);
             createAutoReport(message);
             setLastNotificationTime(now);
        }
      }
    });

    return () => off(rootRef);
  }, [lastNotificationTime]); 

  // --- HELPER TEKS STATUS ---
  const getStatusText = (val, type) => {
    if (type === 'api') return val === "SAFE" ? "Tidak Terdeteksi" : "Terdeteksi";
    if (type === 'asap') return val === "NORMAL" ? "Normal" : "Bahaya";
    if (type === 'suhu') return val > 50 ? "Bahaya" : "Normal"; 
    if (type === 'kelembaban') return val < 30 ? "Bahaya (Kering)" : "Normal";
    
    // Logic Khusus Kamera
    if (type === 'kamera') {
        if (val === "nofire") return "Aman";
        if (val === "fire") return "Terdeteksi Api";
        return "Menunggu...";
    }
    return "Normal";
  };

  return (
    <div className={`${styles.page} ${!sidebarOpen ? styles.sidebarCollapsed : ''}`} suppressHydrationWarning>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage="/monitoring" />

      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchBar}>
            <Image src="/Search.png" alt="Search" width={20} height={20} className={styles.searchIcon} />
            <input type="text" placeholder="Cari Sensor..." className={styles.searchInput} />
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
            
            {/* KARTU STATUS UTAMA */}
            <div className={styles.mainStatusCard}>
                <div className={styles.statusLabelBox}>
                    <span className={styles.statusLabelText}>
                        STATUS<br/>KEADAAN<br/>LOKASI
                    </span>
                </div>
                <div className={styles.statusValueBox}>
                    <span className={`${styles.statusValueText} ${globalStatus !== 'NORMAL' ? styles.danger : ''}`}>
                        {globalStatus}
                    </span>
                </div>
            </div>

            {/* GRID SENSOR */}
            <div className={styles.sensorGrid}>

                {/* SENSOR API (FLAME) */}
                <div className={styles.sensorItem}>
                    <div className={styles.sensorNameBox}>
                        <span className={styles.sensorNameText}>SENSOR<br/>API</span>
                    </div>
                    <div className={styles.sensorDetailBox}>
                        <div className={styles.activeIndicator}>
                            {sensorActive.api ? 'Aktif' : 'Tidak Aktif'} 
                            <span className={`${styles.dot} ${sensorActive.api ? styles.activeDot : styles.inactiveDot}`}></span>
                        </div>
                        <div className={styles.sensorStatusText}>
                            Status Api: <span className={styles.statusHighlight}>{getStatusText(sensorData.api, 'api')}</span>
                        </div>
                    </div>
                </div>

                {/* SENSOR ASAP (MQ135) */}
                <div className={styles.sensorItem}>
                    <div className={styles.sensorNameBox}>
                        <span className={styles.sensorNameText}>SENSOR<br/>ASAP</span>
                    </div>
                    <div className={styles.sensorDetailBox}>
                        <div className={styles.activeIndicator}>
                            {sensorActive.asap ? 'Aktif' : 'Tidak Aktif'} 
                            <span className={`${styles.dot} ${sensorActive.asap ? styles.activeDot : styles.inactiveDot}`}></span>
                        </div>
                        <div className={styles.sensorStatusText}>
                            Status Asap: <span className={styles.statusHighlight}>{getStatusText(sensorData.asap, 'asap')}</span>
                        </div>
                    </div>
                </div>

                {/* SENSOR KELEMBAPAN */}
                <div className={styles.sensorItem}>
                    <div className={styles.sensorNameBox}>
                        <span className={styles.sensorNameText}>SENSOR<br/>KELEMBAPAN</span>
                    </div>
                    <div className={styles.sensorDetailBox}>
                         <div className={styles.activeIndicator}>
                            {sensorActive.kelembaban ? 'Aktif' : 'Tidak Aktif'} 
                            <span className={`${styles.dot} ${sensorActive.kelembaban ? styles.activeDot : styles.inactiveDot}`}></span>
                        </div>
                        <div className={styles.sensorStatusText}>
                            Nilai: <b>{sensorData.kelembaban}%</b> <br/>
                            <span style={{fontSize:'14px', color:'#555'}}>
                                ({getStatusText(sensorData.kelembaban, 'kelembaban')})
                            </span>
                        </div>
                    </div>
                </div>

                {/* SENSOR SUHU */}
                <div className={styles.sensorItem}>
                    <div className={styles.sensorNameBox}>
                        <span className={styles.sensorNameText}>SENSOR<br/>SUHU</span>
                    </div>
                    <div className={styles.sensorDetailBox}>
                         <div className={styles.activeIndicator}>
                            {sensorActive.suhu ? 'Aktif' : 'Tidak Aktif'} 
                            <span className={`${styles.dot} ${sensorActive.suhu ? styles.activeDot : styles.inactiveDot}`}></span>
                        </div>
                        <div className={styles.sensorStatusText}>
                            Nilai: <b>{sensorData.suhu}°C</b> <br/>
                            <span style={{fontSize:'14px', color:'#555'}}>
                                ({getStatusText(sensorData.suhu, 'suhu')})
                            </span>
                        </div>
                    </div>
                </div>

                 {/* ESP32 CAM (SUDAH DIPERBAIKI) */}
                 <div className={styles.sensorItem}>
                    <div className={styles.sensorNameBox}>
                        <span className={styles.sensorNameText}>ESP32<br/>CAM</span>
                    </div>
                    <div className={styles.sensorDetailBox}>
                         <div className={styles.activeIndicator}>
                            {sensorActive.esp32cam ? 'Aktif' : 'Tidak Aktif'} 
                            <span className={`${styles.dot} ${sensorActive.esp32cam ? styles.activeDot : styles.inactiveDot}`}></span>
                        </div>
                        <div className={styles.sensorStatusText}>
                            {/* Menggunakan logic 'kamera' yang baru */}
                            Status Api: <span className={styles.statusHighlight}>{getStatusText(sensorData.esp32cam, 'kamera')}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}