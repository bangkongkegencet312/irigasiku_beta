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
              color: isActive ? "#16a34a" : "#9ca3af"
            }}
          >
            <Icon 
              size={22} 
              fill={isActive ? "#16a34a" : "none"} 
            />
            <span style={{
              fontSize:"11px",
              fontWeight: isActive ? "600" : "500"
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
    borderTop:"1px solid #eee",
    display:"flex",
    justifyContent:"space-around",
    padding:"10px 0"
  },

  item: {
    display:"flex",
    flexDirection:"column",
    alignItems:"center",
    gap:"4px",
    textDecoration:"none"
  }
}