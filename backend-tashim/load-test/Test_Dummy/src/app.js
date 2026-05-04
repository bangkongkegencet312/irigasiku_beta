import React, { useState, useEffect } from 'react';
import { ref, onValue } from "firebase/database";
import { db } from './firebase'; 
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

function App() {
  const [dataSensor, setDataSensor] = useState({ Suhu: 0, NTU: 0, pH: 0 });
  const [jumlahDataMasuk, setJumlahDataMasuk] = useState(0);
  
  // State untuk menyimpan riwayat data grafik (maksimal 20 titik agar tidak berat)
  const [grafikData, setGrafikData] = useState([]);

  useEffect(() => {
    // Sesuaikan dengan struktur node di Firebase Anda
    const sensorRef = ref(db, 'Curtain_Data'); 
    
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDataSensor(data);
        setJumlahDataMasuk((prev) => prev + 1);

        // Menambahkan data baru ke dalam grafik beserta waktu (timestamp)
        const waktuSekarang = new Date().toLocaleTimeString();
        setGrafikData((prevData) => {
          const dataBaru = [...prevData, { time: waktuSekarang, ...data }];
          // Membatasi grafik hanya menampilkan 20 riwayat terakhir agar web tidak crash saat load test
          if (dataBaru.length > 20) {
            return dataBaru.slice(dataBaru.length - 20);
          }
          return dataBaru;
        });
      }
    });

    return () => unsubscribe(); 
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>Dashboard Load Testing & Visualisasi TA</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', width: '48%' }}>
          <h2>Nilai Aktual Sensor:</h2>
          <p><strong>Suhu:</strong> {dataSensor.Suhu} °C</p>
          <p><strong>Turbidity (NTU):</strong> {dataSensor.NTU}</p>
          <p><strong>pH:</strong> {dataSensor.pH}</p>
        </div>
        
        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', width: '48%' }}>
          <h2>Intensitas Beban (Load Rate):</h2>
          <p>Total paket data diunduh dari Firebase:</p>
          <h1 style={{ color: 'red', margin: '0' }}>{jumlahDataMasuk} kali</h1>
        </div>
      </div>

      {/* Bagian Visualisasi Grafik */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: '0' }}>Grafik Pergerakan Data Real-Time</h3>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <LineChart data={grafikData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Suhu" stroke="#ff7300" strokeWidth={2} isAnimationActive={false} />
              <Line type="monotone" dataKey="NTU" stroke="#387908" strokeWidth={2} isAnimationActive={false} />
              <Line type="monotone" dataKey="pH" stroke="#8884d8" strokeWidth={2} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default App;