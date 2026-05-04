const mqtt = require('mqtt');
const admin = require('firebase-admin');

// 1. Inisialisasi Akses Firebase
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Ganti URL ini dengan URL Realtime Database milik Anda yang ada di Firebase Console
  databaseURL: "https://irigasiku-beta-default-rtdb.asia-southeast1.firebasedatabase.app" 
});
const db = admin.database();

// 2. Inisialisasi Akses HiveMQ
const options = {
  host: '9575f087603642b38802e20db41742bf.s1.eu.hivemq.cloud', // [cite: 1]
  port: 8883, // [cite: 2]
  protocol: 'mqtts',
  username: 'tetomiku', // [cite: 2]
  password: 'TetoMiku1' // [cite: 2]
};
const mqttClient = mqtt.connect(options);

mqttClient.on('connect', () => {
  console.log('✅ Jembatan AKTIF! Berlangganan ke HiveMQ...');
  // Berlangganan ke semua data sensor
  mqttClient.subscribe('tetomiku/sensor/#'); 
});

// 3. Menerima dari MQTT dan Menyimpan ke Firebase
mqttClient.on('message', (topic, message) => {
  const nilaiData = parseFloat(message.toString());
  console.log(`[Data Masuk] Topik: ${topic} -> Nilai: ${nilaiData}`);

  // Mengelompokkan dan menyimpan data ke dalam folder Firebase 'Data_Sensor'
  if (topic.includes("suhu")) {
    db.ref('Data_Sensor/Suhu').set(nilaiData);
  } else if (topic.includes("ntu")) {
    db.ref('Data_Sensor/NTU').set(nilaiData);
  } else if (topic.includes("ph")) {
    db.ref('Data_Sensor/pH').set(nilaiData);
  }
});

mqttClient.on('error', (err) => {
  console.error('❌ Terjadi kesalahan pada MQTT:', err);
});