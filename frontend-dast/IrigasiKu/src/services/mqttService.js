import mqtt from "mqtt"
import useIoTStore from "../store/iotStore"
import { MODE } from "../config"

const updateStore = (newData) => {
  const store = useIoTStore.getState()
  const currentSensor = store.sensor
  const mergedData = { ...currentSensor, ...newData }

  store.setSensorData(mergedData)
  store.addHistory({
    time: Date.now(), 
    ...mergedData
  })
}

if (MODE === "MQTT") {
  console.log("📡 MODE: MQTT ACTIVE (WATCHDOG ENABLED)")

  const client = mqtt.connect("wss://9575f087603642b38802e20db41742bf.s1.eu.hivemq.cloud:8884/mqtt", {
    username: "tetomiku",
    password: "TetoMiku1",
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
  })

  // 👇 FITUR BARU: WATCHDOG TIMER
  let watchdog = null;

  const resetWatchdog = () => {
    // Bersihkan timer lama setiap ada data masuk
    clearTimeout(watchdog);
    
    // Set status jadi Connected (Hijau) karena data masuk!
    useIoTStore.getState().setSettings("isConnected", true);
    
    // Set timer baru: Kalau 15 detik ke depan diam saja, putuskan koneksi!
    watchdog = setTimeout(() => {
      console.log("⏳ 15 Detik tidak ada data. ESP32 Offline!");
      useIoTStore.getState().setSettings("isConnected", false);
    }, 15000); 
  };

  client.on("connect", () => {
    console.log("✅ Terhubung ke Server Broker HiveMQ");
    client.subscribe("sensor/ph");
    client.subscribe("sensor/tds");
    client.subscribe("sensor/suhu");
    
    // Jangan ubah isConnected jadi 'true' di sini!
    // Biarkan tetap 'false' agar Dashboard nampilin layar "Menunggu Sinyal"
    // sampai ada data beneran yang masuk dari ESP32.
  })

  client.on("message", (topic, message) => {
    const rawValue = message.toString()
    const value = Number(rawValue) || 0
    let sensorUpdate = {}

    if (topic === "sensor/ph") sensorUpdate = { ph: value }
    else if (topic === "sensor/tds") sensorUpdate = { turbidity: value } 
    else if (topic === "sensor/suhu") sensorUpdate = { temp: value }
    
    updateStore(sensorUpdate)
    
    // Panggil anjing penjaga setiap kali data dari backend masuk
    resetWatchdog();
  })

  client.on("close", () => useIoTStore.getState().setSettings("isConnected", false))
  client.on("offline", () => useIoTStore.getState().setSettings("isConnected", false))
  client.on("error", () => useIoTStore.getState().setSettings("isConnected", false))
}