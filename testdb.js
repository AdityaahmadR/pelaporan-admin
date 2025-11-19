import connectDB from "./db.js";

const test = async () => {
  try {
    const db = await connectDB();
    const [rows] = await db.query("SELECT NOW() as waktu");
    console.log("Connected:", rows);
  } catch (e) {
    console.error("Error:", e.message);
  }
};

test();

