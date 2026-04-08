import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { time: "08:00", ph: 7.1 },
  { time: "09:00", ph: 7.2 },
  { time: "10:00", ph: 7.3 },
  { time: "11:00", ph: 7.1 },
]

export default function History() {

  const downloadCSV = () => {

    const csv = [
      ["Waktu", "pH"],
      ...data.map((d) => [d.time, d.ph])
    ]

    const content =
      "data:text/csv;charset=utf-8," +
      csv.map((e) => e.join(",")).join("\n")

    const link = document.createElement("a")

    link.href = encodeURI(content)
    link.download = "riwayat_kualitas_air.csv"

    link.click()
  }

  return (
    <div style={{ padding: "20px" }}>

      <h2>Riwayat Kualitas Air</h2>

      <LineChart width={350} height={200} data={data}>
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line dataKey="ph" stroke="#16a34a" />
      </LineChart>

      <button
        onClick={downloadCSV}
        style={{
          marginTop: "20px",
          padding: "10px",
          background: "#16a34a",
          color: "white",
          border: "none",
          borderRadius: "8px"
        }}
      >
        Download Data
      </button>

    </div>
  )
}