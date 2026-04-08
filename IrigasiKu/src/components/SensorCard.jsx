import { FlaskConical, Thermometer, Eye } from "lucide-react"

export default function SensorCard({ title, value, unit, status }) {

  // ===== ICON LOGIC =====
  let Icon = FlaskConical
  let iconColor = "#16a34a"
  let bgColor = "#e6f4ea"

  if (title === "Suhu Air") {
    Icon = Thermometer
    iconColor = "#2563eb"
    bgColor = "#e8f0fe"
  }

  if (title === "Kekeruhan") {
    Icon = Eye
    iconColor = status === "Bahaya" ? "#dc2626" : "#2563eb"
    bgColor = status === "Bahaya" ? "#fdecea" : "#e8f0fe"
  }

  if (status === "Bahaya") {
    iconColor = "#dc2626"
    bgColor = "#fdecea"
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

      {/* VALUE */}
      <h2 style={styles.value}>
        {value} {unit}
      </h2>

      {/* STATUS */}
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

/* ===== STYLE ===== */
const styles = {
  card: {
    background: "#fff",
    padding: "14px",
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
    gap: "6px",
    marginBottom: "10px",
    fontSize: "12px",
    color: "#6b7280"
  },

  iconBox: {
    padding: "5px",
    borderRadius: "8px"
  },

  title: {
    fontSize: "12px"
  },

  value: {
    margin: "0 0 10px 0",
    fontSize: "25px",
    fontWeight: "bold",
    color: "#111827"
  },

  badge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600"
  }
}

/* ===== STATUS STYLE ===== */
function getStatusBg(status){
  if(status === "Bahaya") return "#fdecea"
  if(status === "Bersih") return "#e8eaf6"
  return "#e6f4ea"
}

function getStatusColor(status){
  if(status === "Bahaya") return "#dc2626"
  if(status === "Bersih") return "#3f51b5"
  return "#16a34a"
}