import StatusCard from "../components/StatusCard"
import SensorCard from "../components/SensorCard"
import useIoTStore from "../store/iotStore"

export default function Dashboard() {

  const { sensor } = useIoTStore()

  const status =
    sensor.ph < 6.5 ||
    sensor.ph > 8.5 ||
    sensor.turbidity > 20
      ? "BAHAYA"
      : "AMAN"

  return (
    <div style={{ padding: "20px" }}>

      <StatusCard status={status} />

      <h3 style={{ marginTop: "20px" }}>
        Sensor Monitoring
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
          marginTop: "10px"
        }}
      >
        <SensorCard
          title="pH Air"
          value={sensor.ph}
          unit=""
          status="normal"
        />

        <SensorCard
          title="Suhu Air"
          value={sensor.temp}
          unit="°C"
          status="normal"
        />

        <SensorCard
          title="Kekeruhan"
          value={sensor.turbidity}
          unit="NTU"
          status="bersih"
        />
      </div>

    </div>
  )
}