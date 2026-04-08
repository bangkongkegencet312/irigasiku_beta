import mqtt from "mqtt"
import useIoTStore from "../store/iotStore"
import { MODE } from "../config"

// ===== HELPER =====
const updateStore = (data) => {
  const store = useIoTStore.getState()

  store.setSensorData(data)
  store.addHistory({
    time: new Date().toLocaleTimeString(),
    ...data
  })
}

// =========================
// 🟢 MOCK MODE
// =========================
if (MODE === "MOCK") {
  console.log("🧪 MODE: MOCK")

  setInterval(() => {
    const fakeData = {
      ph: +(Math.random() * 3 + 6).toFixed(1),
      temp: +(Math.random() * 10 + 25).toFixed(1),
      turbidity: Math.floor(Math.random() * 30)
    }

    updateStore(fakeData)

  }, 3000)
}

// =========================
// 🔵 MQTT MODE
// =========================
if (MODE === "MQTT") {
  console.log("📡 MODE: MQTT")

  const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt")

  client.on("connect", () => {
    console.log("MQTT Connected")
    client.subscribe("irigasiku/sensor")
  })

  client.on("message", (topic, message) => {
    try {
      const data = JSON.parse(message.toString())
      updateStore(data)
    } catch (err) {
      console.log("MQTT ERROR:", err)
    }
  })
}

// =========================
// 🟣 API MODE
// =========================
if (MODE === "API") {
  console.log("🌐 MODE: API")

  setInterval(async () => {
    try {
      const res = await fetch("https://dummy-api-irigasi.com/data")
      const data = await res.json()

      updateStore(data)

    } catch (err) {
      console.log("API ERROR:", err)
    }
  }, 5000)
}