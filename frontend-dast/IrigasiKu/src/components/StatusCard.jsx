import sawah from "../assets/sawah.jpg"

export default function StatusCard({ status }) {

  const safe = status === "AMAN"

  return (
    <div
      style={{
        backgroundImage: `url(${sawah})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "20px",
        padding: "28px 16px",
        color: "white",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: safe
          ? "0 8px 20px rgba(0,0,0,0.08)"
          : "0 8px 25px rgba(220,38,38,0.35)"
      }}
    >

      {/* overlay */}
      <div
        style={{
          position:"absolute",
          inset:0,
          background: safe
            ? "rgba(22,163,74,0.7)"
            : "rgba(220,38,38,0.75)"
        }}
      />

      <div style={{position:"relative"}}>

        {/* icon */}
        <div
          style={{
            width:"56px",
            height:"56px",
            margin:"auto",
            borderRadius:"50%",
            background:"rgba(255, 255, 255, 0.2)",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            fontSize:"24px"
          }}
        >
          {safe ? "🛡️" : "⚠️"}
        </div>

        {/* TITLE */}
        <h3 style={{
          marginTop:"12px",
          fontSize:"16px",
          fontWeight:"600",
          color:"rgba(255,255,255,0.9)"
        }}>
          Kualitas Air
        </h3>

        {/* STATUS */}
        <h1 style={{
          fontSize:"30px",
          marginTop:"4px",
          fontWeight:"900",
          letterSpacing:"1px",
          color: safe ? "#ffffff" : "#ffe5e5"
        }}>
          {status}
        </h1>

        {/* DESCRIPTION */}
        <p style={{
          marginTop:"10px",
          fontSize:"14px"
        }}>
          {safe
            ? "Berdasarkan pH, suhu, dan kekeruhan"
            : "Beberapa parameter berada di luar batas normal"
          }
        </p>

        {/* TIME */}
        <p style={{
          marginTop:"6px",
          fontSize:"12px"
        }}>
          Terakhir diperbarui: {new Date().toLocaleTimeString()}
        </p>

      </div>

    </div>
  )
}