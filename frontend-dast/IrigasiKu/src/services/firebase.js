// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// TODO: GANTI DENGAN KODE CONFIG MILIK ANDA SENDIRI DARI FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyChPwwsngyOjaGbXNI-rgLH8jRpal2wa4w",
  authDomain: "irigasiku-beta.firebaseapp.com",
  databaseURL: "https://irigasiku-beta-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "irigasiku-beta",
  storageBucket: "irigasiku-beta.firebasestorage.app",
  messagingSenderId: "88266588317",
  appId: "1:88266588317:web:90201d36dc789bd9df9474",
  measurementId: "G-TSYMKWP99W"
};

// Inisialisasi Firebase App, Auth, dan Database Firestore
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * HELPER: Mengubah input Nomor HP menjadi format email buatan agar bisa masuk Firebase Auth
 * Contoh: "08123456789" diubah otomatis menjadi "08123456789@irigasiku.com"
 */

const formatIdentifier = (identifier) => {
  if (!identifier.includes("@")) {
    // Jika input tidak mengandung '@', diasumsikan itu nomor telepon
    const cleanPhone = identifier.replace(/[^0-9]/g, ""); // membersihkan karakter selain angka
    return `${cleanPhone}@irigasiku.com`;
  }
  return identifier; // jika email asli, biarkan apa adanya
};

/**
 * FITUR 1: Registrasi Akun Baru ATAU Login Pengguna
 * Mengakomodasi login via nomor telepon + password atau email langsung.
 */
export const loginOrRegister = async (identifier, password, isRegister = false) => {
  const formattedEmail = formatIdentifier(identifier);
  let userCredential;

  if (isRegister) {
    // Proses pendaftaran akun baru di Firebase Auth
    userCredential = await createUserWithEmailAndPassword(auth, formattedEmail, password);
    
    // Setelah berhasil daftar di Auth, buat dokumen profil user di Firestore koleksi 'users'
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      emailOrPhone: identifier, // menyimpan no hp asli atau email asli pengguna
      createdAt: new Date()
    });
  } else {
    // Proses login untuk akun yang sudah terdaftar
    userCredential = await signInWithEmailAndPassword(auth, formattedEmail, password);
  }
  
  return userCredential.user; // Mengembalikan data user termasuk UID uniknya
};

/**
 * FITUR 2a: Generate dan Simpan Kode OTP ke Firestore
 * Membuat 6 digit integer acak yang berlaku selama 5 menit.
 */
export const generateAndSaveOTP = async (userId) => {
  // Membuat 6 digit angka acak berbentuk string agar angka '0' di depan tidak hilang
  const randomOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const expiredAt = new Date(Date.now() + 5 * 60 * 1000); // Waktu sekarang + 5 Menit kedepan

  // Simpan/Timpa dokumen OTP berdasarkan UID User di koleksi 'otps'
  await setDoc(doc(db, "otps", userId), {
    otpCode: randomOTP,
    expiredAt: expiredAt,
    isVerified: false
  });

  // KETIKA DEVELOPMENT: Munculkan kode di console browser agar Anda bisa testing tanpa gateway SMS
  console.log(`%c[KODE OTP ANDA]: ${randomOTP}`, "background: #222; color: #bada55; font-size: 16pxpx");
  
  return randomOTP;
};

/**
 * FITUR 2b: Verifikasi Kode OTP yang Dimasukkan User
 */
export const verifyOTP = async (userId, inputOtp) => {
  const otpDocRef = doc(db, "otps", userId);
  const otpSnapshot = await getDoc(otpDocRef);

  if (!otpSnapshot.exists()) {
    throw new Error("Kode OTP tidak ditemukan. Silakan minta kode baru.");
  }

  const data = otpSnapshot.data();

  // Validasi 1: Cek waktu kedaluwarsa
  if (new Date() > data.expiredAt.toDate()) {
    throw new Error("Kode OTP sudah kedaluwarsa! Silakan minta kode baru.");
  }

  // Validasi 2: Cek kecocokan kode angka
  if (data.otpCode !== inputOtp) {
    throw new Error("Kode OTP yang Anda masukkan salah!");
  }

  // Jika benar, ubah status verifikasi menjadi true di database
  await updateDoc(otpDocRef, { isVerified: true });
  return true;
};

/**
 * FITUR 3a: Cek Apakah User Sudah Pernah Mengisi Kredensial Perangkat MQTT
 * Digunakan untuk menentukan alur routing (apakah wajib ke halaman setup atau langsung ke dashboard)
 */
export const checkDeviceConfig = async (userId) => {
  const deviceSnapshot = await getDoc(doc(db, "devices", userId));
  return deviceSnapshot.exists(); // Menghasilkan 'true' jika sudah ada, atau 'false' jika belum ada
};

/**
 * FITUR 3b: Menyimpan Kredensial Perangkat Baru (MQTT URL, Name, Password)
 */
export const saveDeviceConfig = async (userId, mqttUrl, nameCred, passCred) => {
  await setDoc(doc(db, "devices", userId), {
    userId: userId,
    mqttUrl: mqttUrl,
    mqttName: nameCred,
    mqttPassword: passCred, // Tersimpan aman terikat dengan UID User
    updatedAt: new Date()
  });
};