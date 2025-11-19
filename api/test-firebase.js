import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

export default function handler(req, res) {
  try {
    res.status(200).json({
      status: "Firebase Terhubung!",
      example_uid: "cek-firebase"
    });
  } catch (err) {
    res.status(500).json({
      status: "Firebase Error",
      error: err.message
    });
  }
}
