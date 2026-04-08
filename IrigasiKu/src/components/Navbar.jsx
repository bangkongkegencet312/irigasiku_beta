import logo from "../assets/logo.png"

export default function Navbar() {
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

      <div style={{color:"#16a34a",fontSize:"14px"}}>
        ● Connected
      </div>
    </div>
  )
}