import "./services/mqttService"

import { BrowserRouter, Routes, Route } from "react-router-dom"

import Dashboard from "./pages/Dashboard"
import History from "./pages/History"
import Settings from "./pages/Settings"

export default function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />

      </Routes>

    </BrowserRouter>
  )
}