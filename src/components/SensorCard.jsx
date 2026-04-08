export default function SensorCard({ title, value, unit, status }) {

  const color = {
    normal: "#16a34a",
    bahaya: "#dc2626",
    bersih: "#2563eb"
  }

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "15px",
        textAlign: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
      }}
    >
      <p>{title}</p>

      <h2>
        {value} {unit}
      </h2>

      <span
        style={{
          background: color[status],
          color: "white",
          padding: "4px 10px",
          borderRadius: "10px",
          fontSize: "12px"
        }}
      >
        {status}
      </span>
    </div>
  )
}