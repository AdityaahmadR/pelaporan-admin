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
  
  // State untuk tracking apakah sudah mengirim laporan darurat
  const [daruratSent, setDaruratSent] = useState(false);

  // Fungsi untuk mengirim laporan darurat
  const kirimLaporanDarurat = async () => {
    if (daruratSent) return; // Sudah pernah kirim, skip

    try {
      const deskripsi = `DARURAT! Semua sensor mendeteksi bahaya:
- Sensor Api: Terdeteksi
- Sensor Asap: Bahaya  
- Sensor Kelembapan: Bahaya
- Sensor Suhu: Bahaya
- ESP32 CAM: Api Terdeteksi

Segera lakukan tindakan darurat!`;

      // Kirim laporan darurat ke database
      const response = await fetch('/api/semua-laporan/darurat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userID: 'admin', // Admin sebagai pengirim
          deskripsi: deskripsi,
          lokasi: null // Tidak ada lokasi spesifik
        })
      });

      if (response.ok) {
        console.log('Laporan darurat berhasil dikirim');
        setDaruratSent(true);
        
        // Kirim notifikasi ke petugas
        await fetch('/api/kirim-notifikasi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userID: 'admin', // Kirim ke admin/petugas
            type: 'laporan_darurat',
            title: 'DARURAT! Kebakaran Terdeteksi',
            body: 'Semua sensor mendeteksi bahaya. Segera lakukan tindakan darurat!'
          })
        });
        
        alert('DARURAT! Laporan darurat telah dikirim ke petugas.');
      }
    } catch (error) {
      console.error('Gagal kirim laporan darurat:', error);
    }
  };

  useEffect(() => {
    // Path Root '/' untuk membaca semua data ESP32
    const sensorRef = ref(dbIoT, '/'); 
    
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Data dari Firebase:', data); // Debug log
      
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

        console.log('Data yang dipetakan:', newData); // Debug log

        // Update status aktif sensor berdasarkan data yang diterima
        // Sensor dianggap aktif jika field ada di Firebase (termasuk nilai 0, false, dll)
        const newActiveStatus = {
          api: data.hasOwnProperty('api') || data.hasOwnProperty('fire'),
          asap: data.hasOwnProperty('asap') || data.hasOwnProperty('smoke'),
          kelembaban: data.hasOwnProperty('kelembaban') || data.hasOwnProperty('hum'),
          suhu: data.hasOwnProperty('suhu') || data.hasOwnProperty('temp'),
          esp32cam: data.hasOwnProperty('cam_fire') || data.hasOwnProperty('esp32cam')
        };

        console.log('Status aktif sensor:', newActiveStatus); // Debug log

        setSensorData(newData);
        setSensorActive(newActiveStatus);

        // --- LOGIKA STATUS UTAMA ---
        // DARURAT: Jika SEMUA sensor mendeteksi bahaya/api
        // BAHAYA: Jika ada sensor yang mendeteksi bahaya tapi tidak semua
        // NORMAL: Jika tidak ada sensor yang mendeteksi bahaya
        
        const allDanger = (
          newData.api == 1 && 
          newData.asap == 1 && 
          newData.kelembaban == 1 && 
          newData.suhu > 50 && 
          newData.esp32cam == 1
        );
        
        const anyDanger = (
          newData.api == 1 || 
          newData.asap == 1 || 
          newData.kelembaban == 1 || 
          newData.suhu > 50 || 
          newData.esp32cam == 1
        );
        
        let newStatus = "NORMAL";
        if (allDanger) {
          newStatus = "DARURAT";
          // Trigger laporan darurat jika belum pernah dikirim
          if (globalStatus !== "DARURAT") {
            kirimLaporanDarurat();
          }
        } else if (anyDanger) {
          newStatus = "BAHAYA";
        }
        
        setGlobalStatus(newStatus);
      }
    });

    return () => off(sensorRef);
  }, []);

  // Helper untuk teks status (Biar kodenya rapi)
  const getStatusText = (val, type) => {
    if (type === 'api') return val == 1 ? "Terdeteksi" : "Tidak Terdeteksi";
    if (type === 'bahaya') return val == 1 ? "Bahaya" : "Normal";
    if (type === 'suhu') return val > 50 ? "Bahaya" : "Normal"; 
    if (type === 'kelembaban') return val == 1 ? "Bahaya" : "Normal"; // Kelembaban bahaya jika == 1
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
                            {sensorActive.api ? 'Aktif' : 'Tidak Aktif'} <span className={`${styles.dot} ${sensorActive.api ? styles.activeDot : styles.inactiveDot}`}></span>
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
                            {sensorActive.asap ? 'Aktif' : 'Tidak Aktif'} <span className={`${styles.dot} ${sensorActive.asap ? styles.activeDot : styles.inactiveDot}`}></span>
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
                            {sensorActive.kelembaban ? 'Aktif' : 'Tidak Aktif'} <span className={`${styles.dot} ${sensorActive.kelembaban ? styles.activeDot : styles.inactiveDot}`}></span>
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
                            {sensorActive.suhu ? 'Aktif' : 'Tidak Aktif'} <span className={`${styles.dot} ${sensorActive.suhu ? styles.activeDot : styles.inactiveDot}`}></span>
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
                            {sensorActive.esp32cam ? 'Aktif' : 'Tidak Aktif'} <span className={`${styles.dot} ${sensorActive.esp32cam ? styles.activeDot : styles.inactiveDot}`}></span>
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