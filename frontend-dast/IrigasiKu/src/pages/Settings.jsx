import { LogOut, User, Bell, Wifi, Clock, Info, ChevronRight, ShieldCheck } from "lucide-react"
import Navbar from "../components/Navbar"
import BottomNav from "../components/BottomNav"
import useIoTStore, { startSensorStream } from "../store/iotStore"

export default function Settings() {
  const { user, logout, settings, setSettings } = useIoTStore()

  const handleDropdownChange = (e) => {
    const newVal = parseInt(e.target.value);
    setSettings("interval", newVal);
    setTimeout(() => startSensorStream(), 100);
  };

  const kontakInfo = user?.email || user?.noHp || "Belum ada info kontak";
  const namaUser = user?.nama || "Petani IrigasiKu";

  return (
    <div className="app-container" style={styles.mainWrapper}>
      <Navbar />

      <div style={styles.scrollArea}>
        <h2 style={styles.title}>Pengaturan</h2>

        {/* KARTU PROFIL */}
        <div style={styles.card}>
          <div style={styles.profileContent}>
            <div style={styles.avatar}>
              <User size={30} color="#fff" />
            </div>
            <div style={{ marginLeft: "15px" }}>
              <h4 style={{ margin: 0, fontSize: "18px" }}>{namaUser}</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>{kontakInfo}</p>
            </div>
          </div>
        </div>

        {/* PENGATURAN PERANGKAT */}
        <p style={styles.sectionTitle}>Pengaturan Perangkat</p>
        <div style={styles.card}>
          <div style={styles.item}>
            <div style={{...styles.iconBox, background: settings?.isConnected !== false ? "#eefdf3" : "#fee2e2"}}>
              <Wifi size={20} color={settings?.isConnected !== false ? "#16a34a" : "#dc2626"} />
            </div>
            <div style={styles.itemText}>
              <p style={styles.label}>Koneksi Perangkat IoT</p>
              <p style={{...styles.subLabel, color: settings?.isConnected !== false ? "#9ca3af" : "#dc2626"}}>
                {settings?.isConnected !== false ? "Terhubung - WiFi" : "Terputus - Gagal terhubung"}
              </p>
            </div>
          </div>
          <div style={{...styles.item, border: "none"}}>
            <div style={{...styles.iconBox, background: "#eff6ff"}}><Clock size={20} color="#3b82f6" /></div>
            <div style={styles.itemText}>
              <p style={styles.label}>Waktu Interval Update Data Saat ini</p>
              <p style={styles.subLabel}>{settings.interval} Detik</p>
            </div>
          </div>
        </div>

        {/* PENGATURAN PERINGATAN */}
        <p style={styles.sectionTitle}>Pengaturan Peringatan</p>
        <div style={styles.card}>
          <div style={styles.item}>
            <div style={{...styles.iconBox, background: "#fff7ed"}}><Clock size={20} color="#ea580c" /></div>
            <div style={styles.itemText}>
              <p style={styles.label}>Interval Update Data</p>
            </div>
            <select value={settings.interval} onChange={handleDropdownChange} style={styles.selectDropdown}>
              <option value={1}>1 Detik</option>
              <option value={3}>3 Detik</option>
              <option value={5}>5 Detik</option>
            </select>
          </div>

          <div style={{...styles.item, border: "none"}}>
            <div style={{...styles.iconBox, background: "#fef2f2"}}><Bell size={20} color="#dc2626" /></div>
            <div style={styles.itemText}>
              <p style={styles.label}>Notifikasi Bahaya</p>
            </div>
            <label style={styles.switch}>
              <input type="checkbox" checked={settings.notification} onChange={(e) => setSettings("notification", e.target.checked)} style={{ display: "none" }} />
              <span style={{...styles.slider, background: settings.notification ? "#16a34a" : "#ccc"}}>
                <span style={{...styles.ball, transform: settings.notification ? "translateX(20px)" : "translateX(0px)"}} />
              </span>
            </label>
          </div>
        </div>

        {/* INFO APLIKASI */}
        <p style={styles.sectionTitle}>Info Aplikasi</p>
        <div style={styles.card}>
          <div style={styles.item}>
            <div style={{...styles.iconBox, background: "#eff6ff"}}><ShieldCheck size={20} color="#3b82f6" /></div>
            <div style={styles.itemText}>
              <p style={styles.label}>Sumber Standar Kualitas Air</p>
              <p style={styles.subLabel}>FAO & PP No. 22 Tahun 2021</p>
            </div>
          </div>
          <div style={{...styles.item, border: "none"}}>
            <div style={{...styles.iconBox, background: "#eff6ff"}}><Info size={20} color="#3b82f6" /></div>
            <div style={styles.itemText}>
              <p style={styles.label}>Versi Aplikasi</p>
              <p style={styles.subLabel}>1.0.0</p>
            </div>
          </div>
        </div>

        {/* TOMBOL KELUAR */}
        <button onClick={() => {
          sessionStorage.removeItem("isIotConnected"); // REVISI: Hapus memori agar pas login muter lagi
          logout();
        }} style={styles.btnLogout}>
          <LogOut size={20} style={{ marginRight: "10px" }} />
          Keluar dari Akun
        </button>

      </div>
      <BottomNav />
    </div>
  )
}

const styles = {
  mainWrapper: { height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" },
  scrollArea: { flex: 1, overflowY: "auto", padding: "20px", paddingBottom: "120px" },
  title: { textAlign: "center", marginBottom: "25px", color: "#1f2937", fontWeight: "bold" },
  sectionTitle: { fontSize: "13px", color: "#6b7280", margin: "20px 0 10px 5px", fontWeight: "600" },
  card: { background: "#fff", borderRadius: "20px", padding: "5px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", marginBottom: "15px" },
  profileContent: { display: "flex", alignItems: "center", padding: "15px 0" },
  avatar: { width: "55px", height: "55px", borderRadius: "50%", background: "#075985", display: "flex", alignItems: "center", justifyContent: "center" },
  item: { display: "flex", alignItems: "center", padding: "15px 0", borderBottom: "1px solid #f3f4f6" },
  iconBox: { width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" },
  itemText: { flex: 1, marginLeft: "15px" },
  label: { margin: 0, fontSize: "14px", fontWeight: "500", color: "#374151" },
  subLabel: { margin: 0, fontSize: "12px", color: "#9ca3af" },
  selectDropdown: { padding: "8px 12px", borderRadius: "10px", border: "1px solid #ddd", background: "#f9fafb", fontSize: "13px", color: "#374151", outline: "none", cursor: "pointer" },
  switch: { position: "relative", display: "inline-block", width: "44px", height: "24px", cursor: "pointer" },
  slider: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: "24px", transition: "0.4s" },
  ball: { position: "absolute", height: "18px", width: "18px", left: "3px", bottom: "3px", background: "white", borderRadius: "50%", transition: "0.4s" },
  btnLogout: { width: "100%", padding: "16px", borderRadius: "16px", border: "1px solid #fee2e2", background: "#fff", color: "#dc2626", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "20px", cursor: "pointer" }
}