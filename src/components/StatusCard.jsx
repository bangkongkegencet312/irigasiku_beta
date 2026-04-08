export default function StatusCard({ status }) {
  const safe = status === "AMAN"

  return (
    <div
      style={{
        padding: "30px",
        borderRadius: "20px",
        color: "white",
        textAlign: "center",
        background: safe ? "#16a34a" : "#dc2626",
      }}
    >
      <h2>Kualitas Air</h2>
      <h1 style={{ fontSize: "32px" }}>{status}</h1>
      <p>Berdasarkan pH, suhu, dan kekeruhan</p>
    </div>
  )
}