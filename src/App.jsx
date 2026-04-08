import { BrowserRouter, Routes, Route } from "react-router-dom"

import Dashboard from "./pages/Dashboard"
import History from "./pages/History"
import Settings from "./pages/Settings"

import Navbar from "./components/Navbar"
import BottomNav from "./components/BottomNav"

export default function App() {

  return (
    <BrowserRouter>

      <Navbar/>

      <Routes>

        <Route path="/" element={<Dashboard/>} />

        <Route path="/history" element={<History/>} />

        <Route path="/settings" element={<Settings/>} />

      </Routes>

      <BottomNav/>

    </BrowserRouter>
  )
}