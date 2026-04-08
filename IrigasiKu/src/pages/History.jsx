import { useState } from "react"
import Navbar from "../components/Navbar"
import BottomNav from "../components/BottomNav"
import useIoTStore from "../store/iotStore"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function History() {

  const { history } = useIoTStore()

  const [param, setParam] = useState("ph")
  const [range, setRange] = useState("24jam")

  // ===== FILTER REAL DATETIME =====
  const filteredData = history.filter(item => {
    const itemTime = new Date(item.timestamp)
    const diffMinutes = (Date.now() - itemTime) / (1000 * 60)

    if (range === "24jam") return diffMinutes <= 1440
    if (range === "7hari") return diffMinutes <= 10080
    if (range === "30hari") return diffMinutes <= 43200

    return true
  })

  const data = filteredData.slice(0, 10).reverse()

  // ===== FORMAT TIME =====
  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString()
  }

  const formatDate = (ts) => {
    return new Date(ts).toLocaleDateString()
  }

  // ===== UNIT =====
  const getUnit = () => {
    if (param === "temp") return "°C"
    if (param === "turbidity") return "NTU"
    return ""
  }

  // ===== THRESHOLD =====
  const isDanger = (val) => {
    if (param === "ph") return val < 6.5 || val > 8.5
    if (param === "temp") return val < 20 || val > 30
    if (param === "turbidity") return val > 20
  }

  const chartColor = data.some(d => isDanger(d[param]))
    ? "#dc2626"
    : "#16a34a"

  // ===== CSV PRO VERSION =====
  const downloadCSV = () => {

    const header = "Tanggal,Waktu,pH,Suhu,Kekeruhan\n"

    const rows = data.map(d => {
      const date = new Date(d.timestamp)
      return `${date.toLocaleDateString()},${date.toLocaleTimeString()},${d.ph},${d.temp},${d.turbidity}`
    }).join("\n")

    const blob = new Blob([header + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `irigasiku-${range}.csv`
    a.click()
  }

  return (
    <div className="app-container">

      <Navbar />

      <div style={styles.content}>

        <h2 style={styles.title}>Riwayat Kualitas Air</h2>

        {/* RANGE */}
        <div style={styles.tabs}>
          {[
            { key: "24jam", label: "24 Jam" },
            { key: "7hari", label: "7 Hari" },
            { key: "30hari", label: "1 Bulan" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setRange(tab.key)}
              style={range === tab.key ? styles.activeTab : styles.tab}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PARAM */}
        <select
          value={param}
          onChange={(e) => setParam(e.target.value)}
          style={styles.select}
        >
          <option value="ph">pH</option>
          <option value="temp">Suhu (°C)</option>
          <option value="turbidity">Kekeruhan (NTU)</option>
        </select>

        {/* CHART */}
        <div style={styles.chartCard}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="timestamp" tickFormatter={formatTime} />
              <YAxis />
              <Tooltip labelFormatter={(val) => formatTime(val)} />
              <Line
                type="monotone"
                dataKey={param}
                stroke={chartColor}
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* LOG */}
        <h3 style={styles.subTitle}>Data Log</h3>

        {data.map((item, i) => {

          const danger = isDanger(item[param])

          return (
            <div key={i} style={styles.logCard}>

              <div>
                <p>{formatTime(item.timestamp)}</p>
                <span style={{
                  ...styles.badge,
                  background: danger ? "#fdecea" : "#e6f4ea",
                  color: danger ? "#dc2626" : "#16a34a"
                }}>
                  {danger ? "Bahaya" : "Normal"}
                </span>
              </div>

              <h4>
                {item[param]} {getUnit()}
              </h4>

            </div>
          )
        })}

      </div>

      {/* BUTTON FIXED */}
      <button style={styles.btn} onClick={downloadCSV}>
        Download CSV
      </button>

      <BottomNav />
    </div>
  )
}

/* STYLE */
const styles = {
  content: {
    padding: "16px",
    paddingBottom: "120px"
  },

  title: {
    textAlign: "center",
    marginBottom: "16px"
  },

  tabs: {
    display: "flex",
    background: "#eee",
    borderRadius: "10px",
    padding: "4px",
    marginBottom: "12px"
  },

  tab: {
    flex: 1,
    padding: "8px",
    border: "none",
    background: "transparent",
    borderRadius: "8px",
    fontSize: "12px"
  },

  activeTab: {
    flex: 1,
    padding: "8px",
    border: "none",
    background: "#16a34a",
    color: "#fff",
    borderRadius: "8px",
    fontSize: "12px"
  },

  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ddd"
  },

  chartCard: {
    marginTop: "12px",
    background: "#fff",
    padding: "16px",
    borderRadius: "16px"
  },

  subTitle: {
    marginTop: "20px",
    marginBottom: "10px"
  },

  logCard: {
    display: "flex",
    justifyContent: "space-between",
    background: "#fff",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "8px"
  },

  badge: {
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "10px"
  },

  btn: {
    position: "fixed",
    bottom: "70px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 32px)",
    maxWidth: "420px",
    padding: "12px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    zIndex: 100
  }
}