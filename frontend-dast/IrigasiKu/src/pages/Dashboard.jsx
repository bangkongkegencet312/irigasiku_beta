import { useState, useEffect } from "react"
import { AlertTriangle, CheckCircle, RefreshCw, WifiOff } from "lucide-react"
import Navbar from "../components/Navbar"
import BottomNav from "../components/BottomNav"
import StatusCard from "../components/StatusCard"
import SensorCard from "../components/SensorCard"
import useIoTStore from "../store/iotStore"
import logo from "../assets/logo.png"

export default function Dashboard() {
  const { sensor, settings } = useIoTStore()
  const [lastUpdate, setLastUpdate] = useState("Baru saja")
  
  // 👇 State untuk efek loading singkat di awal (Cold Start)
  const [initialLoad, setInitialLoad] = useState(true)
  
  const isDisconnected = settings?.isConnected !== true

  const phDanger = sensor.ph < 6.0 || sensor.ph > 9.0
  const tempDanger = sensor.temp < 20 || sensor.temp > 35
  const tdsDanger = sensor.turbidity > 500 

  const displayPh = Number(sensor.ph).toFixed(1)
  const displayTemp = Number(sensor.temp).toFixed(1)
  const displayTds = Number(sensor.turbidity).toFixed(0)

  let status = "AMAN", statusColor = "#16a34a"
  if (phDanger) { 
    status = "BAHAYA"
    statusColor = "#dc2626" 
  } else if (tempDanger || tdsDanger) { 
    status = "WASPADA"
    statusColor = "#f59e0b"
  }

  const [showToast, setShowToast] = useState(false)
  const shouldNotify = (phDanger || tempDanger || tdsDanger) && settings.notification
  
  let toastMessage = "Kualitas air irigasi menurun!"
  if (phDanger) toastMessage = "Kadar pH di luar batas aman!"
  else if (tempDanger) toastMessage = "Suhu air terlalu ekstrem!"
  else if (tdsDanger) toastMessage = "Kadar TDS air terlalu tinggi!"

  // Effect untuk loading awal (mati setelah 1.5 detik)
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoad(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Effect untuk notifikasi Toast
  useEffect(() => {
    if (shouldNotify) {
      setShowToast(true)
      const timer = setTimeout(() => setShowToast(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [shouldNotify])

  // Effect untuk update teks waktu
  useEffect(() => {
    if (isDisconnected) {
      setLastUpdate("Menunggu koneksi...")
    } else {
      setLastUpdate("Baru saja")
    }
  }, [sensor, isDisconnected])

  // 👇 UI Loading yang cuma muncul 1.5 detik pertama kali web dibuka 👇
  if (initialLoad) {
    return (
      <div className="app-container" style={styles.loadingContainer}>
        <style>{`
          @keyframes spin-ring { to { transform: rotate(360deg); } }
          @keyframes pulse-logo { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        `}</style>
        <div style={styles.spinnerWrap}>
          <img src={logo} alt="IrigasiKu" style={styles.loadingLogo} />
          <div style={styles.spinnerRing}></div>
        </div>
        <p style={{color: '#16a34a', fontWeight: 'bold', marginTop: '30px', fontSize: '15px', textAlign: 'center'}}>
          Memuat IrigasiKu...
        </p>
      </div>
    )
  }

  return (
    <div className="app-container" style={styles.mainWrapper}>
      {showToast && (
        <div style={{...styles.toast, background: statusColor}}>
          <AlertTriangle size={20} color="#fff" />
          <div style={{marginLeft: "10px"}}>
            <p style={{margin: 0, fontWeight: "bold", fontSize: "14px", color: "#fff"}}>PERINGATAN!</p>
            <p style={{margin: 0, fontSize: "12px", color: "#fff"}}>{toastMessage}</p>
          </div>
        </div>
      )}
      
      <Navbar />

      {/* Banner Offline yang muncul kalau alat ngadat */}
      {isDisconnected && (
        <div style={styles.offlineBanner}>
          <WifiOff size={16} color="#991b1b" />
          <p style={styles.offlineText}>
            Sinyal alat terputus. Menampilkan data terakhir.
          </p>
        </div>
      )}

      <div style={styles.scrollArea}>
        <StatusCard status={status} color={isDisconnected ? "#9ca3af" : statusColor} />
        
        <p style={styles.sectionTitle}>Sensor Monitoring </p>
        <div style={styles.grid}>
          <SensorCard title="pH Air" value={displayPh} status={isDisconnected ? "-" : (phDanger ? "Bahaya" : "Normal")} color={isDisconnected ? "#9ca3af" : (phDanger ? "#dc2626" : "#16a34a")} />
          <SensorCard title="Suhu" value={displayTemp} unit="°C" status={isDisconnected ? "-" : (tempDanger ? "Waspada" : "Normal")} color={isDisconnected ? "#9ca3af" : (tempDanger ? "#f59e0b" : "#16a34a")} />
          <SensorCard title="Kekeruhan" value={displayTds} unit="ppm" status={isDisconnected ? "-" : (tdsDanger ? "Waspada" : "Bersih")} color={isDisconnected ? "#9ca3af" : (tdsDanger ? "#f59e0b" : "#16a34a")} />
        </div>

        <p style={styles.sectionTitle}>Aktivitas & Status Terkini</p>
        <div style={styles.card}>
          <div style={styles.item}>
            <div style={{...styles.iconBox, background: isDisconnected ? "#f3f4f6" : (status === "AMAN" ? "#f0fdf4" : status === "BAHAYA" ? "#fef2f2" : "#fffbeb")}}>
              {isDisconnected ? <WifiOff size={20} color="#9ca3af" /> : (status === "AMAN" ? <CheckCircle size={20} color="#16a34a" /> : <AlertTriangle size={20} color={statusColor} />)}
            </div>
            <div style={styles.itemText}>
              <p style={{...styles.label, color: isDisconnected ? "#6b7280" : (status === "AMAN" ? "#16a34a" : statusColor), fontWeight: "bold"}}>
                {isDisconnected ? "Sistem Offline" : (status === "BAHAYA" ? "Saran: Tutup Pintu Air" : status === "WASPADA" ? "Saran: Cek Lokasi Irigasi" : "Sistem Optimal")}
              </p>
              <p style={styles.subLabel}>
                {isDisconnected ? "Menunggu koneksi ulang ke alat IoT di sawah." : 
                 (status === "BAHAYA" ? "pH air tidak aman bagi tanaman padi." : 
                 status === "WASPADA" ? "Kualitas air menurun, tetap pantau." : 
                 "Kondisi air sangat baik untuk irigasi.")}
              </p>
            </div>
            <p style={styles.timeLabel}>{lastUpdate}</p>
          </div>
          <div style={{...styles.item, border: "none"}}>
            <div style={{...styles.iconBox, background: isDisconnected ? "#fee2e2" : "#eff6ff"}}>
              {isDisconnected ? <AlertTriangle size={18} color="#dc2626" /> : <RefreshCw size={18} color="#3b82f6" />}
            </div>
            <div style={styles.itemText}>
              <p style={{...styles.label, color: isDisconnected ? "#dc2626" : "#374151"}}>Sinkronisasi Data</p>
              <p style={styles.subLabel}>{isDisconnected ? "Gagal menerima data terbaru." : "Berhasil memperbarui data dari sensor IoT"}</p>
            </div>
            <p style={styles.timeLabel}>{isDisconnected ? "Terhenti" : "Baru saja"}</p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

const styles = {
  mainWrapper: { height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "sans-serif", backgroundColor: "#f8fafc" },
  scrollArea: { flex: 1, overflowY: "auto", paddingTop: "20px", paddingLeft: "20px", paddingRight: "20px", paddingBottom: "100px" },
  title: { textAlign: "center", marginBottom: "25px", color: "#1f2937", fontWeight: "bold", fontSize: "20px" },
  sectionTitle: { fontSize: "13px", color: "#6b7280", margin: "25px 0 10px 5px", fontWeight: "600" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "10px" },
  card: { background: "#fff", borderRadius: "20px", padding: "5px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", marginBottom: "15px" },
  item: { display: "flex", alignItems: "center", padding: "15px 0", borderBottom: "1px solid #f3f4f6" },
  iconBox: { width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  itemText: { flex: 1, marginLeft: "15px" },
  label: { margin: 0, fontSize: "14px", fontWeight: "500", color: "#374151" },
  subLabel: { margin: 0, fontSize: "12px", color: "#9ca3af", lineHeight: "1.4" },
  timeLabel: { fontSize: "11px", color: "#9ca3af", marginLeft: "10px" },
  toast: { position: "absolute", top: "15px", left: "15px", right: "15px", padding: "15px", borderRadius: "12px", display: "flex", alignItems: "center", zIndex: 1000, animation: "slideDown 0.3s ease" },
  
  // Style Banner Offline
  offlineBanner: { backgroundColor: "#fee2e2", padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #f87171" },
  offlineText: { margin: "0 0 0 8px", fontSize: "12px", color: "#991b1b", fontWeight: "600" },
  
  // Style Loading Awal (Spinner)
  loadingContainer: { background: "#f8fdf9", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "sans-serif" },
  spinnerWrap: { position: "relative", width: "100px", height: "100px", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingLogo: { width: "60px", animation: "pulse-logo 2s infinite ease-in-out", zIndex: 1 },
  spinnerRing: { position: "absolute", inset: "-10px", borderRadius: "50%", border: "5px solid #e0f2fe", borderTopColor: "#16a34a", borderRightColor: "#075985", animation: "spin-ring 1s linear infinite", zIndex: 0 }
}