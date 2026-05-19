import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import BottomNav from "../components/BottomNav"
import useIoTStore from "../store/iotStore"
import * as XLSX from "xlsx"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts"

export default function History() {
  const { history } = useIoTStore()
  const [param, setParam] = useState("ph")
  const [range, setRange] = useState("24h")

  /* =========================================================================
     [UNTUK IHSAN - TUGAS BACKEND - INTEGRASI DATA RIWAYAT]
     Saat ini, 'safeHistory' mengambil data dari memori browser (Zustand).
     TUGAS IHSAN:
     1. Buat state baru, misal: const [dbHistory, setDbHistory] = useState([])
     2. Ganti referensi 'history' di bawah ini dengan 'dbHistory' hasil fetch dari API/Firebase.
     3. Pastikan format object dari API sama persis: 
        { time: 171890123000 (timestamp/ms), ph: 7.2, temp: 28.5, turbidity: 12 }
  ========================================================================= */
  const safeHistory = history.length ? history : [{ time: Date.now(), ph: 7, temp: 25, turbidity: 10 }]
  const now = Date.now()

  /* [UNTUK IHSAN]: Taruh fungsi Fetch Database kamu di dalam useEffect ini */
  useEffect(() => {
    // Contoh alur buat Ihsan:
    // const fetchData = async () => {
    //   const data = await fetchHistoryFromFirebase(range);
    //   setDbHistory(data);
    // }
    // fetchData();
  }, [range]) // Akan otomatis nge-fetch ulang tiap user ganti tab 24h / 7d / 1m

  // ===== LOGIKA STATUS & LABEL =====
  const getStatusInfo = (v, p = param) => {
    const val = Number(v)
    if (p === "ph") {
      if (val < 6.0 || val > 9.0) return { label: "Bahaya", color: "#dc2626", bg: "#fdecea" }
      return { label: "Normal", color: "#16a34a", bg: "#e6f4ea" }
    }
    if (p === "temp" && (val < 20 || val > 35)) return { label: "Bahaya", color: "#dc2626", bg: "#fdecea" }
    if (p === "turbidity" && val > 20) return { label: "Bahaya", color: "#dc2626", bg: "#fdecea" }
    return { label: "Normal", color: "#16a34a", bg: "#e6f4ea" }
  }

  const getParamLabel = (p) => {
    if (p === "ph") return "pH"
    if (p === "temp") return "Suhu"
    return "Kekeruhan"
  }

  const getUnit = (p) => {
    if (p === "temp") return "°C"
    if (p === "turbidity") return "ppm"
    return ""
  }

  // ===== FUNGSI AGREGASI DATA (Digunakan Grafik & Excel) =====
  function groupData(data, r, p) {
    if (r === "24h") {
      return data.slice(0, 30).map(d => ({
        label: new Date(d.time).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        value: Number(d[p])
      })).reverse() // Untuk 24h: Grafik baca dari lama ke baru
    }
    
    const mapData = {}
    
    // Kita balik datanya saat nge-grup biar terurut dari waktu terlama ke terbaru.
    // Ini bikin grafik LineChart menggambar garis dari kiri (lama) ke kanan (baru).
    const reversedData = [...data].reverse();

    reversedData.forEach(d => {
      const dateObj = new Date(d.time);
      let key = "";
      
      if (r === "7d") {
        // Format: "Senin, 15 Mei '26"
        const dayName = dateObj.toLocaleDateString("id-ID", { weekday: "long" });
        const dateNum = dateObj.getDate();
        const monthName = dateObj.toLocaleDateString("id-ID", { month: "short" }); // Pake "short" biar bulan Mei disingkat
        const year = dateObj.getFullYear().toString().slice(-2); // Ambil 2 angka terakhir tahun
        
        key = `${dayName}, ${dateNum} ${monthName} '${year}`;
      } else {
        // Format: "Minggu 1, Mei '26"
        const weekNum = Math.ceil(dateObj.getDate() / 7);
        const monthName = dateObj.toLocaleDateString("id-ID", { month: "short" });
        const year = dateObj.getFullYear().toString().slice(-2); // Ambil 2 angka terakhir tahun
        
        key = `Minggu ${weekNum}, ${monthName} '${year}`;
      }

      if (!mapData[key]) mapData[key] = []
      mapData[key].push(Number(d[p]))
    })

    return Object.keys(mapData).map(k => ({
      label: k,
      value: Number((mapData[k].reduce((a, b) => a + b, 0) / mapData[k].length).toFixed(1))
    }))
  }

  const filteredForChart = safeHistory.filter(d => {
    const t = new Date(d.time).getTime()
    if (range === "24h") return now - t <= 86400000
    if (range === "7d") return now - t <= 604800000
    return now - t <= 2592000000
  })

  const chartData = groupData(filteredForChart, range, param)
  const currentStatus = getStatusInfo(chartData[chartData.length - 1]?.value)

  // ===== CARA 1: EXPORT FILTER (1 FILE, 3 SHEET: 24h, 7d, 1m) =====
  const handleDownloadFiltered = () => {
    const wb = XLSX.utils.book_new()
    const ranges = ["24h", "7d", "1m"]
    const labels = ["24 Jam", "7 Hari", "1 Bulan"]

    ranges.forEach((r, idx) => {
      const rangeFiltered = safeHistory.filter(d => {
        const t = new Date(d.time).getTime()
        if (r === "24h") return now - t <= 86400000
        if (r === "7d") return now - t <= 604800000
        return now - t <= 2592000000
      })

      const aggregatedData = groupData(rangeFiltered, r, param)
      
      const dataToExport = (r === "24h" ? rangeFiltered.slice(0, 100) : [...aggregatedData].reverse()).map(d => {
        const val = r === "24h" ? d[param] : d.value
        const category = r === "24h" 
          ? new Date(d.time).toLocaleTimeString("en-US", { hour12: true }).replace(/:/g, '.')
          : d.label
        
        return {
          "Kategori": category,
          "Parameter": getParamLabel(param),
          "Nilai": val,
          "Satuan": getUnit(param),
          "Status": getStatusInfo(val, param).label
        }
      })

      const ws = XLSX.utils.json_to_sheet(dataToExport)
      XLSX.utils.book_append_sheet(wb, ws, labels[idx])
    })

    XLSX.writeFile(wb, `Laporan_${getParamLabel(param)}_Lengkap.xlsx`)
  }

  // ===== CARA 2: EXPORT SEMUA (REKAP SEMUA PARAMETER) =====
  const handleDownloadAll = () => {
    /* [UNTUK IHSAN]: 
       Hati-hati! Jika data di database sudah berjumlah ratusan ribu baris, 
       menarik semuanya untuk di-export bisa membuat browser HP crash (Out of Memory).
       Disarankan membuat batasan fetch limit (misal: max 10.000 data terakhir), 
       atau proses generate Excel-nya dipindah ke sisi Server/Cloud Functions.
    */
    const wb = XLSX.utils.book_new()
    const rawData = safeHistory.map(d => ({
      "Waktu": new Date(d.time).toLocaleString("id-ID"),
      "pH": d.ph, "Status pH": getStatusInfo(d.ph, "ph").label,
      "Suhu": d.temp, "Status Suhu": getStatusInfo(d.temp, "temp").label,
      "Keruh": d.turbidity, "Status Keruh": getStatusInfo(d.turbidity, "turbidity").label
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rawData), "Data Mentah")
    XLSX.writeFile(wb, `IrigasiKu_Full_Database.xlsx`)
  }

  return (
    <div className="app-container" style={{fontFamily: 'sans-serif'}}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.static}>
          <h2 style={styles.title}>Riwayat Kualitas Air</h2>
          <div style={styles.range}>
            {["24h", "7d", "1m"].map(r => (
              <button key={r} onClick={() => setRange(r)} style={range === r ? styles.active : styles.btn}>
                {r === "24h" ? "24 Jam" : r === "7d" ? "7 Hari" : "1 Bulan"}
              </button>
            ))}
          </div>
          <select value={param} onChange={(e) => setParam(e.target.value)} style={styles.select}>
            <option value="ph">pH Air</option>
            <option value="temp">Suhu (°C)</option>
            <option value="turbidity">Kekeruhan</option>
          </select>
          <div style={styles.chart}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" fontSize={10} tick={{fill: '#9ca3af'}} />
                <YAxis fontSize={10} tick={{fill: '#9ca3af'}} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke={currentStatus.color} strokeWidth={3} dot={range !== "24h"} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.scroll}>
          <h3 style={{fontSize: '16px', color: '#374151'}}>Data Log ({range === '24h' ? 'Detik' : 'Rerata'})</h3>
          {/* Karena chartData urutannya lama ke baru, kita reverse() di sini biar log terbaru selalu di atas */}
          {(range === "24h" ? filteredForChart.slice(0, 50) : [...chartData].reverse()).map((d, i) => {
            const val = range === "24h" ? d[param] : d.value
            const timeLabel = range === "24h" 
              ? new Date(d.time).toLocaleTimeString("en-US", { hour12: true }).replace(/:/g, '.')
              : d.label
            const status = getStatusInfo(val)
            return (
              <div key={i} style={styles.logCard}>
                <div>
                  <p style={{margin: 0, fontSize: "14px", fontWeight: '500'}}>{timeLabel}</p>
                  <span style={{ ...styles.badge, background: status.bg, color: status.color }}>{status.label}</span>
                </div>
                <h4 style={{margin: 0, color: '#1f2937'}}>{val} {getUnit(param)}</h4>
              </div>
            )
          })}
        </div>

        <div style={styles.btnGroup}>
          <button style={styles.downloadSmall} onClick={handleDownloadFiltered}>Export Laporan {getParamLabel(param)}</button>
          <button style={styles.downloadAll} onClick={handleDownloadAll}>Export Semua Data</button>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

const styles = {
  container: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  static: { padding: "16px" },
  scroll: { 
    flex: 1, 
    overflowY: "auto", 
    paddingTop: "0",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingBottom: "180px" 
  },
  title: { textAlign: "center", marginBottom: "16px", color: '#1f2937', fontWeight: 'bold' },
  range: { display: "flex", background: "#eee", padding: "4px", borderRadius: "10px" },
  btn: { flex: 1, padding: "8px", border: "none", background: "transparent", fontSize: '13px' },
  active: { flex: 1, padding: "8px", border: "none", background: "#16a34a", color: "#fff", borderRadius: "8px", fontSize: '13px', fontWeight: 'bold' },
  select: { width: "100%", marginTop: "15px", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", outline: 'none' },
  chart: { marginTop: "15px", background: "#fff", padding: "16px", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  logCard: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "15px", borderRadius: "12px", marginTop: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.02)" },
  badge: { padding: "3px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: "bold", marginTop: '5px', display: 'inline-block' },
  btnGroup: { position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: "388px", display: "flex", gap: "10px", zIndex: 100 },
  downloadSmall: { flex: 1, padding: "16px", background: "#fff", color: "#16a34a", border: "2px solid #16a34a", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: '11px' },
  downloadAll: { flex: 1, padding: "16px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "12px", boxShadow: "0 6px 16px rgba(0,0,0,0.2)", cursor: "pointer", fontWeight: "bold", fontSize: '11px' }
}