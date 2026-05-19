import { Link, useLocation } from "react-router-dom"
import { Home, History, Settings } from "lucide-react"

export default function BottomNav(){

  const location = useLocation()

  const menus = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/history", label: "Riwayat", icon: History },
    { path: "/settings", label: "Pengaturan", icon: Settings }
  ]

  return (
    <div style={styles.container}>
      {menus.map((menu) => {

        const isActive = location.pathname === menu.path
        const Icon = menu.icon
        
        return (
          <Link 
            key={menu.path}
            to={menu.path}
            style={{
              ...styles.item,
              color: isActive ? "#16a34a" : "#9ca3af" // Warna teks hijau jika aktif, abu jika tidak
            }}
          >
            <Icon 
              size={24} 
              // 👇 REVISI: Selalu gunakan warna stroke sesuai status
              color={isActive ? "#16a34a" : "#9ca3af"} 
              
              // 👇 PERBAIKAN UTAMA: Matikan fill total, jadikan semua outline
              fill="none" 
              
              // 👇 Tambahkan strokeWidth agar lebih tebal saat menu aktif
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span style={{
              fontSize:"12px",
              fontWeight: isActive ? "600" : "500", // Teks lebih tebal saat aktif
              marginTop: "2px"
            }}>
              {menu.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

const styles = {
  container: {
    position:"absolute",
    bottom:0,
    left:0,
    right:0,
    background:"#fff",
    borderTop:"1px solid #e5e7eb",
    display:"flex",
    justifyContent:"space-around",
    padding:"12px 0 10px 0",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.03)",
    zIndex: 100 // Pastikan navbar selalu di depan
  },
  item: {
    display:"flex",
    flexDirection:"column",
    alignItems:"center",
    gap:"4px",
    textDecoration:"none",
    width: "70px"
  }
}