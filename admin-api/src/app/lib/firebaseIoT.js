// src/lib/firebaseIoT.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Config dari teman Anda
const iotConfig = {
  apiKey: "AIzaSyCiIB_UcxWdaJLrdhwggrEGwdG234LDks0",
  authDomain: "esp32-antiapi.firebaseapp.com",
  databaseURL: "https://esp32-antiapi-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "esp32-antiapi",
  storageBucket: "esp32-antiapi.firebasestorage.app",
  messagingSenderId: "986489780094",
  appId: "1:986489780094:web:11a0f4500bc5b456f0252f"
};

// Inisialisasi Firebase Khusus IoT
// Kita beri nama "IOT_APP" agar tidak bentrok dengan firebase lain (jika ada)
let iotApp;

if (getApps().length > 0 && getApps().find(app => app.name === "IOT_APP")) {
    iotApp = getApp("IOT_APP");
} else {
    iotApp = initializeApp(iotConfig, "IOT_APP");
}

// Export Database Realtime
export const dbIoT = getDatabase(iotApp);