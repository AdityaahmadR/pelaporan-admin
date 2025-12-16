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

  // State Data Sensor (Default sesuai struktur DB Anda)
  const [sensorData, setSensorData] = useState({
    api: "SAFE",      // Default "SAFE"
    asap: "NORMAL",   // Default "NORMAL"
    kelembaban: 0,
    suhu: 0,
    esp32cam: "SAFE"  // Placeholder (belum ada di gambar DB)
  });

  // State Status Aktif Sensor
  const [sensorActive, setSensorActive] = useState({
    api: false,
    asap: false,
    kelembaban: false,
    suhu: false,
    esp32cam: false
  });

  // State Status Global (NORMAL / BAHAYA / DARURAT)
  const [globalStatus, setGlobalStatus] = useState("NORMAL");
  
  // State Spam Protection (Agar notifikasi tidak dikirim berulang-ulang)
  const [lastNotificationTime, setLastNotificationTime] = useState(0);

  // --- FUNGSI KIRIM NOTIFIKASI ---
  const sendNotification = async (type, title, message) => {
    try {
      const response = await fetch('/api/kirim-notifikasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userID: 'admin', 
          type: type,
          title: title,
          body: message
        })
      });
      if (response.ok) console.log(`Notifikasi ${type} berhasil dikirim`);
    } catch (error) {
      console.error('Gagal kirim notifikasi:', error);
    }
  };
  
  // --- FUNGSI BUAT LAPORAN OTOMATIS ---
  const createAutoReport = async (description) => {
      try {
         const response = await fetch('/api/semua-laporan/darurat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userID: 'sistem_iot', 
              deskripsi: description,
              lokasi: 'Gedung Utama (Deteksi Sensor)' 
            })
          });
          if(response.ok) console.log("Laporan otomatis dibuat di database");
      } catch (error) {
          console.error("Gagal buat laporan otomatis", error);
      }
  }

  useEffect(() => {
    // 1. UPDATE PATH DATABASE:
    // Mengarah ke folder "fire_detection_system" sesuai gambar Firebase Anda
    const systemRef = ref(dbIoT, 'fire_detection_system'); 
    
    const unsubscribe = onValue(systemRef, (snapshot) => {
      const data = snapshot.val();
      
      // Pastikan data dan folder 'sensors' ada sebelum dibaca
      if (data && data.sensors) {
        const s = data.sensors; // Jalan pintas ke object 'sensors'
        const sys = data.system; // Jalan pintas ke object 'system'

        // --- 2. PEMETAAN DATA (MAPPING) SESUAI STRUKTUR FIREBASE ANDA ---
        const newData = {
            // Sensor Api (Flame) -> status ("SAFE" / "DANGER")
            api: s.flame?.status || "SAFE",
            
            // Sensor Asap (MQ135) -> level ("NORMAL" / "WARNING")
            asap: s.mq135?.level || "NORMAL",
            
            // Sensor Kelembaban (Humidity) -> value (Angka)
            kelembaban: s.humidity?.value || 0,
            
            // Sensor Suhu (Temperature) -> value (Angka)
            suhu: s.temperature?.value || 0,
            
            // ESP32 Cam (Belum ada di gambar, kita set default SAFE)
            esp32cam: "SAFE" 
        };

        // --- 3. CEK STATUS AKTIF (Berdasarkan keberadaan data) ---
        // Jika data sensor tidak 'undefined', berarti sensor AKTIF/Terhubung
        const newActiveStatus = {
          api: s.flame !== undefined,
          asap: s.mq135 !== undefined,
          kelembaban: s.humidity !== undefined,
          suhu: s.temperature !== undefined,
          esp32cam: false // Set false dulu karena belum ada folder kameranya
        };

        setSensorData(newData);
        setSensorActive(newActiveStatus);

        // --- 4. LOGIKA STATUS GLOBAL ---
        // Kita ambil langsung dari sistem Anda: system -> danger_status
        let currentStatus = sys?.danger_status || "NORMAL";
        
        // Terjemahkan bahasa DB ke Bahasa Indonesia untuk Tampilan UI
        if (currentStatus === "SAFE") currentStatus = "NORMAL";
        if (currentStatus === "DANGER") currentStatus = "BAHAYA";

        setGlobalStatus(currentStatus);

        // --- 5. LOGIKA NOTIFIKASI ---
        const now = Date.now();
        const COOLDOWN = 5 * 60 * 1000; // Jeda 5 Menit antar notifikasi

        // Jika Status BAHAYA dan masa jeda (cooldown) sudah lewat
        if ((currentStatus === "BAHAYA" || currentStatus === "DARURAT") && (now - lastNotificationTime > COOLDOWN)) {
             const message = `Sistem mendeteksi bahaya! Status Lokasi: ${currentStatus}. Suhu: ${newData.suhu}°C`;
             
             // A. Kirim Notifikasi ke Admin
             sendNotification('bahaya_sensor', '🔥 PERINGATAN BAHAYA!', message);
             
             // B. Buat Laporan Otomatis
             createAutoReport(message);

             // Update waktu terakhir notifikasi
             setLastNotificationTime(now);
        }
      }
    });

    return () => off(systemRef);
  }, [lastNotificationTime]); 

  // --- HELPER UNTUK TEKS STATUS (Disesuaikan dengan String dari Firebase) ---
  const getStatusText = (val, type) => {
    // Logika untuk API (Flame)
    if (type === 'api') {
        // Di DB tertulis "SAFE", jika bukan SAFE berarti Terdeteksi
        return val === "SAFE" ? "Tidak Terdeteksi" : "Terdeteksi";
    }
    // Logika untuk Asap (MQ135)
    if (type === 'asap') {
        // Di DB tertulis "NORMAL", jika bukan NORMAL berarti Bahaya
        return val === "NORMAL" ? "Normal" : "Bahaya";
    }
    // Logika untuk Suhu
    if (type === 'suhu') {
        return val > 50 ? "Bahaya" : "Normal"; 
    }
    // Logika untuk Kelembaban
    if (type === 'kelembaban') {
        // Contoh: Terlalu kering (<30) bisa memicu api
        return val < 30 ? "Bahaya (Kering)" : "Normal";
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
            
            {/* 1. KARTU STATUS UTAMA */}
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

            {/* 2. GRID SENSOR */}
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

                 {/* ESP32 CAM (Placeholder) */}
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