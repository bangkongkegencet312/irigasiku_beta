import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import BottomNav from "../components/BottomNav"
import StatusCard from "../components/StatusCard"
import SensorCard from "../components/SensorCard"
import useIoTStore from "../store/iotStore"

export default function Dashboard() {

  const { sensor } = useIoTStore()

  // ===== DETEKSI PER SENSOR =====
  const phDanger = sensor.ph < 6.5 || sensor.ph > 8.5
  const turbidityDanger = sensor.turbidity > 20
  const tempDanger = sensor.temp < 20 || sensor.temp > 30

  // ===== HITUNG TOTAL ERROR =====
  const dangerCount = [phDanger, turbidityDanger, tempDanger].filter(Boolean).length

  // ===== RULE: MINIMAL 2 SENSOR =====
  const isDanger = dangerCount >= 2

  const status = isDanger ? "BAHAYA" : "AMAN"

  // ===== TOAST STATE =====
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (isDanger) {
      setShowToast(true)

      const timer = setTimeout(() => {
        setShowToast(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isDanger])

  return (
    <div className="app-container">

      {/* ===== TOAST ===== */}
      {showToast && (
        <div style={styles.toast}>
          <div style={styles.toastIcon}>⚠️</div>
          <div>
            <strong>PERINGATAN!</strong>
            <p style={{ margin: 0, fontSize: "12px" }}>
              Kualitas air tidak aman
            </p>
          </div>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <Navbar />

      {/* ===== MAIN CONTENT ===== */}
      <div style={styles.content}>

        <StatusCard status={status} />

        <section style={styles.section}>
          <h3 style={styles.title}>Sensor Monitoring</h3>

          <div style={styles.grid}>
            <SensorCard
              title="pH Air"
              value={sensor.ph}
              unit=""
              status={phDanger ? "Bahaya" : "Normal"}
            />

            <SensorCard
              title="Suhu Air"
              value={sensor.temp}
              unit="°C"
              status={tempDanger ? "Bahaya" : "Normal"}
            />

            <SensorCard
              title="Kekeruhan"
              value={sensor.turbidity}
              unit="NTU"
              status={turbidityDanger ? "Bahaya" : "Bersih"}
            />
          </div>
        </section>

        <section style={styles.section}>
          <h3 style={styles.title}>Notifikasi</h3>

          {isDanger && (
            <div style={styles.dangerNotif}>
              <div style={styles.dangerIcon}>!</div>
              <div>
                <h4 style={styles.notifTitle}>PERINGATAN!</h4>
                <p style={styles.notifText}>
                  Minimal dua parameter kualitas air berada di luar batas normal.
                </p>
                <span style={styles.notifTime}>Baru saja</span>
              </div>
            </div>
          )}

          <div style={styles.notification}>
            <div style={styles.icon}>i</div>
            <div>
              <h4 style={styles.notifTitle}>Perangkat Terhubung</h4>
              <p style={styles.notifText}>
                Perangkat sensor berhasil terhubung.
              </p>
              <span style={styles.notifTime}>1 jam yang lalu</span>
            </div>
          </div>
        </section>

      </div>

      <BottomNav />

    </div>
  )
}

/* ===== STYLE ===== */
const styles = {
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    paddingBottom: "90px"
  },

  section: {
    marginTop: "28px"
  },

  title: {
    marginBottom: "12px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1f2937"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px"
  },

  /* ===== TOAST ===== */
  toast: {
    position: "absolute",
    top: "10px",
    left: "10px",
    right: "10px",
    background: "#333",
    color: "#fff",
    padding: "12px",
    borderRadius: "12px",
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    zIndex: 999,
    animation: "slideDown 0.3s ease",
    backdropFilter: "blur(6px)"
  },

  toastIcon: {
    fontSize: "18px"
  },

  notification: {
    background: "#f0f7ff",
    border: "1px solid #c7ddff",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    gap: "12px"
  },

  icon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb"
  },

  dangerNotif: {
    background: "#fce8e6",
    border: "1px solid #f5c2c0",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    gap: "12px",
    marginBottom: "12px"
  },

  dangerIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#f8d7da",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#d93025"
  },

  notifTitle: {
    fontSize: "14px",
    fontWeight: "600"
  },

  notifText: {
    fontSize: "12px",
    color: "#6b7280"
  },

  notifTime: {
    fontSize: "11px",
    color: "#9ca3af"
  }
}