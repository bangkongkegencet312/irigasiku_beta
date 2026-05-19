import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { WifiOff } from "lucide-react"
import useIoTStore from "@/store/iotStore"
import Dashboard from "@/pages/Dashboard"
import History from "@/pages/History"
import Settings from "@/pages/Settings"
import Auth from "@/pages/Auth"
import NotFound from "@/pages/NotFound"

export default function App() { 
  const { isLoggedIn } = useIoTStore() /*info apakah user sudah login atau belum*/
  
  // State untuk mendeteksi apakah HP pengguna terhubung ke internet atau tidak
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  // Memantau perubahan sinyal HP secara real-time
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <>
      {/* Banner Peringatan Global (Muncul otomatis saat HP hilang sinyal) */}
      {isOffline && (
        <div style={styles.offlineBanner}>
          <WifiOff size={16} />
          <span>Koneksi HP Terputus. Menunggu sinyal internet...</span>
        </div>
      )}

      <BrowserRouter>
        <Routes>
          {/*Kalau udah login tapi iseng buka /login, lempar balik ke Dashboard */}
          <Route path="/login" element={!isLoggedIn ? <Auth /> : <Navigate to="/" />} />
          
          {/* Gerbang Utama Keamanan (Private Routes) */}
          <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/history" element={isLoggedIn ? <History /> : <Navigate to="/login" />} />
          <Route path="/settings" element={isLoggedIn ? <Settings /> : <Navigate to="/login" />} />
          
          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

const styles = {
  offlineBanner: {
    position: "fixed",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "420px", // Mengikuti ukuran app-container
    background: "#dc2626",
    color: "#fff",
    padding: "10px",
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "bold",
    zIndex: 99999, // Pastikan selalu berada di lapisan paling atas
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    animation: "slideDown 0.3s ease"
  }
}