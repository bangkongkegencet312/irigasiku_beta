import { FlaskConical, Thermometer, Eye } from "lucide-react"

export default function SensorCard({ title, value, unit, status }) {

  // ===== ICON LOGIC =====
  let Icon = FlaskConical
  let iconColor = "#16a34a"
  let bgColor = "#e6f4ea"

  // 1. Default Colors by Title
  if (title === "Suhu Air" || title === "Suhu") {
    Icon = Thermometer
    iconColor = "#2563eb"
    bgColor = "#e8f0fe"
  }

  if (title === "Kekeruhan") {
    Icon = Eye
    iconColor = "#2563eb"
    bgColor = "#e8f0fe"
  }

  // 2. Override Colors by Status (UX Priority)
  if (status === "Bahaya") {
    iconColor = "#dc2626"
    bgColor = "#fdecea"
  } else if (status === "Waspada") {
    iconColor = "#f59e0b" // Oranye Waspada
    bgColor = "#fff7ed"    // Oranye Muda
  }

  return (
    <div style={styles.card}>

      {/* HEADER (ICON + TITLE) */}
      <div style={styles.header}>
        <div style={{
          ...styles.iconBox,
          background: bgColor
        }}>
          <Icon size={14} color={iconColor} />
        </div>

        <span style={styles.title}>{title}</span>
      </div>

      {/* VALUE & UNIT DIPISAH BIAR GA NABRAK */}
      <div style={styles.valueContainer}>
        <span style={styles.value}>{value}</span>
        {unit && <span style={styles.unit}>{unit}</span>}
      </div>

      {/* STATUS BADGE */}
      <span style={{
        ...styles.badge,
        background: getStatusBg(status),
        color: getStatusColor(status)
      }}>
        {status}
      </span>

    </div>
  )
}

/* ===== STYLE  ===== */
const styles = {
  card: {
    background: "#fff",
    padding: "12px 8px", // Diperkecil biar muat di grid 3 kolom layar HP
    borderRadius: "16px",
    border: "1px solid #f3f4f6",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginBottom: "10px",
    color: "#6b7280",
    whiteSpace: "nowrap" // Anti anjlok ke bawah
  },
  iconBox: {
    padding: "5px",
    borderRadius: "8px",
    display: "flex"
  },
  title: {
    fontSize: "12px",
    fontWeight: "500"
  },
  valueContainer: {
    display: "flex",
    alignItems: "baseline", // Bikin angka besar dan satuan kecil rata di bawah
    gap: "3px",
    marginBottom: "10px"
  },
  value: {
    fontSize: "22px", // Dikecilin dikit dari 25px
    fontWeight: "bold",
    color: "#111827"
  },
  unit: {
    fontSize: "12px", // Satuan dibikin mini
    fontWeight: "600",
    color: "#6b7280"
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "600",
    whiteSpace: "nowrap" // Anti anjlok
  }
}

/* ===== STATUS STYLE (FIXED FOR WASPADA) ===== */
function getStatusBg(status){
  if(status === "Bahaya") return "#fdecea"
  if(status === "Waspada") return "#fff7ed" // Background Oranye Muda
  if(status === "Bersih") return "#e8eaf6"
  return "#e6f4ea"
}

function getStatusColor(status){
  if(status === "Bahaya") return "#dc2626"
  if(status === "Waspada") return "#f59e0b" // Teks Oranye Waspada
  if(status === "Bersih") return "#3f51b5"
  return "#16a34a"
}