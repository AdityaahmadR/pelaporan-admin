"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import styles from './monitoring.module.css';
import { dbIoT } from '@/lib/firebaseIoT'; // Pastikan path ini benar
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
  
  // State agar notifikasi tidak dikirim berkali-kali (Spam)
  const [lastNotificationTime, setLastNotificationTime] = useState(0);

  // --- FUNGSI KIRIM NOTIFIKASI ---
  const sendNotification = async (type, title, message) => {
    try {
      const response = await fetch('/api/kirim-notifikasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userID: 'admin', // Kirim ke semua admin/petugas
          type: type,
          title: title,
          body: message
        })
      });

      if (response.ok) {
        console.log(`Notifikasi ${type} berhasil dikirim`);
      }
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
              userID: 'sistem_iot', // Penanda bahwa ini dari sistem
              deskripsi: description,
              lokasi: 'Gedung Utama (Deteksi Sensor)' // Bisa disesuaikan
            })
          });
          if(response.ok) console.log("Laporan otomatis dibuat di database");
      } catch (error) {
          console.error("Gagal buat laporan otomatis", error);
      }
  }

  useEffect(() => {
    // Path Root '/' untuk membaca semua data di Firebase
    const sensorRef = ref(dbIoT, '/'); 
    
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        // --- 1. MAPPING DATA (Mengambil data dari Firebase) ---
        // Kita gunakan logika "OR" (||) untuk mengantisipasi nama variabel yang berbeda
        const newData = {
            api: data.api !== undefined ? data.api : (data.fire !== undefined ? data.fire : 0),
            asap: data.asap !== undefined ? data.asap : (data.smoke !== undefined ? data.smoke : 0),
            kelembaban: data.kelembaban !== undefined ? data.kelembaban : (data.hum !== undefined ? data.hum : 0),
            suhu: data.suhu !== undefined ? data.suhu : (data.temp !== undefined ? data.temp : 0),
            esp32cam: data.cam_fire !== undefined ? data.cam_fire : (data.esp32cam !== undefined ? data.esp32cam : 0)
        };

        // --- 2. CEK STATUS AKTIF (PERBAIKAN) ---
        // Sensor dianggap aktif jika datanya TIDAK undefined (artinya ada data masuk)
        const newActiveStatus = {
          api: data.api !== undefined || data.fire !== undefined,
          asap: data.asap !== undefined || data.smoke !== undefined,
          kelembaban: data.kelembaban !== undefined || data.hum !== undefined,
          suhu: data.suhu !== undefined || data.temp !== undefined,
          esp32cam: data.cam_fire !== undefined || data.esp32cam !== undefined
        };

        setSensorData(newData);
        setSensorActive(newActiveStatus);

        // --- 3. LOGIKA BAHAYA ---
        const isApiBahaya = newData.api == 1;
        const isAsapBahaya = newData.asap == 1;
        const isKelembabanBahaya = newData.kelembaban == 1; 
        const isSuhuBahaya = newData.suhu > 50; // Bahaya jika suhu > 50 derajat
        const isCamBahaya = newData.esp32cam == 1;

        // Salah satu bahaya = BAHAYA
        const anyDanger = isApiBahaya || isAsapBahaya || isKelembabanBahaya || isSuhuBahaya || isCamBahaya;
        // Semua bahaya = DARURAT
        const allDanger = isApiBahaya && isAsapBahaya && isKelembabanBahaya && isSuhuBahaya && isCamBahaya;

        // Update Tampilan Status Besar
        if (allDanger) {
            setGlobalStatus("DARURAT");
        } else if (anyDanger) {
            setGlobalStatus("BAHAYA");
        } else {
            setGlobalStatus("NORMAL");
        }

        // --- 4. LOGIKA PENGIRIMAN NOTIFIKASI OTOMATIS ---
        const now = Date.now();
        const COOLDOWN = 5 * 60 * 1000; // 5 Menit (Agar tidak spam notif)

        // Jika ada bahaya DAN sudah lewat 5 menit dari notifikasi terakhir
        if (anyDanger && (now - lastNotificationTime > COOLDOWN)) {
             let messageParts = [];
             if(isApiBahaya) messageParts.push("Api Terdeteksi");
             if(isAsapBahaya) messageParts.push("Asap Tebal");
             if(isSuhuBahaya) messageParts.push(`Suhu Tinggi (${newData.suhu}°C)`);
             if(isCamBahaya) messageParts.push("Kamera Mendeteksi Api");
             
             const message = "PERINGATAN: " + messageParts.join(", ");

             // A. Kirim Notifikasi ke HP/Web Petugas
             sendNotification('bahaya_sensor', '🔥 PERINGATAN BAHAYA!', message);
             
             // B. Buat Laporan Otomatis di Database
             createAutoReport(`Sistem mendeteksi anomali pada sensor. Detail: ${message}`);

             // Update waktu terakhir kirim
             setLastNotificationTime(now);
             
             console.log("Notifikasi Bahaya Dikirim!");
        }
      }
    });

    return () => off(sensorRef);
  }, [lastNotificationTime]); // Dependency agar state waktu terbaca update-nya

  // Helper untuk mengubah angka menjadi teks status
  const getStatusText = (val, type) => {
    if (type === 'api') return val == 1 ? "Terdeteksi" : "Tidak Terdeteksi";
    if (type === 'bahaya') return val == 1 ? "Bahaya" : "Normal";
    if (type === 'suhu') return val > 50 ? "Bahaya" : "Normal"; 
    if (type === 'kelembaban') return val == 1 ? "Bahaya" : "Normal";
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
                    <span className={`${styles.statusValueText} ${globalStatus === 'BAHAYA' ? styles.danger : globalStatus === 'DARURAT' ? styles.emergency : ''}`}>
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
                            {sensorActive.api ? 'Aktif' : 'Tidak Aktif'} 
                            <span className={`${styles.dot} ${sensorActive.api ? styles.activeDot : styles.inactiveDot}`}></span>
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
                            {sensorActive.asap ? 'Aktif' : 'Tidak Aktif'} 
                            <span className={`${styles.dot} ${sensorActive.asap ? styles.activeDot : styles.inactiveDot}`}></span>
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
                            {sensorActive.kelembaban ? 'Aktif' : 'Tidak Aktif'} 
                            <span className={`${styles.dot} ${sensorActive.kelembaban ? styles.activeDot : styles.inactiveDot}`}></span>
                        </div>
                        <div className={styles.sensorStatusText}>
                            Status Kelembapan: <span className={styles.statusHighlight}>{getStatusText(sensorData.kelembaban, 'kelembaban')}</span>
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
                            {sensorActive.suhu ? 'Aktif' : 'Tidak Aktif'} 
                            <span className={`${styles.dot} ${sensorActive.suhu ? styles.activeDot : styles.inactiveDot}`}></span>
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