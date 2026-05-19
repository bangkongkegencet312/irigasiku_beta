import logo from "../assets/logo.png"
import useIoTStore from "../store/iotStore"

export default function Navbar() {
  const { settings } = useIoTStore()
  
  // Baca status dari store, default true jika belum diset
  const isConnected = settings?.isConnected !== false

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 16px",
      background: "#fff",
      borderBottom: "1px solid #eee"
    }}>
      <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
        <img src={logo} alt="logo" style={{height:"32px"}} />
        <h2 style={{margin:0,fontSize:"16px",fontWeight:"600"}} />
      </div>

      <div style={{color: isConnected ? "#16a34a" : "#dc2626",fontSize:"14px", display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold"}}>
        <span style={{width: "8px", height: "8px", borderRadius: "50%", background: isConnected ? "#16a34a" : "#dc2626"}}></span>
        {isConnected ? "Connected" : "Disconnected"}
      </div>
    </div>
  )
}