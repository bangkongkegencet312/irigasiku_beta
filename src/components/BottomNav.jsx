import { Link } from "react-router-dom"

export default function BottomNav(){

  return(
    <div style={{
      position:"fixed",
      bottom:0,
      width:"100%",
      background:"#fff",
      borderTop:"1px solid #ddd",
      display:"flex",
      justifyContent:"space-around",
      padding:"10px"
    }}>

      <Link to="/">Dashboard</Link>

      <Link to="/history">Riwayat</Link>

      <Link to="/settings">Pengaturan</Link>

    </div>
  )

}