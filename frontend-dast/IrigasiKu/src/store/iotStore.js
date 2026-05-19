import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ref, onValue } from "firebase/database";
import { db } from "@/services/firebase"; 
import "@/services/mqttService";

const useIoTStore = create(
  persist(
    (set, get) => ({
      /* ===== AUTH & NAVIGATION STATE ===== */
      user: null,
      isLoggedIn: false,
      authStep: "splash", 
      isNewUser: false,

      /* ===== SENSOR REALTIME ===== */
      sensor: { ph: 7, temp: 26, turbidity: 15 },
      history: [],
      
      settings: { 
        isConnected: false, 
        interval: 3, 
        notification: true 
      },

      /* ===== ACTIONS ===== */
      login: (userData) => {
        set({ 
          user: userData, 
          isLoggedIn: true,
          authStep: "login"
        });
       /* get().startSensorStream();*/
      },

      logout: () => {
        set({ 
          user: null, 
          isLoggedIn: false, 
          authStep: "login",
          isNewUser: false 
        });
        stopSensorStream();
      },

      setAuthStep: (step) => set({ authStep: step }),
      setNewUser: (status) => set({ isNewUser: status }),
      setSensorData: (data) => set({ sensor: data }),
      
      addHistory: (data) => set((state) => ({
        history: [data, ...state.history].slice(0, 5000)
      })),

      setSettings: (key, value) => {
        set((state) => ({
          settings: { ...state.settings, [key]: value }
        }));
      },
    }),
    { 
      name: "irigasiku-storage",
      // 👇 INI DIA KUNCI PENYELAMATNYA: 'partialize'
      // Hanya variabel yang ada di sini yang akan disimpan permanen ke memori browser.
      // Karena 'settings' tidak kita tulis di sini, maka isConnected akan 
      // otomatis keriset jadi 'false' (disconnected) setiap kali tab di-refresh.
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        authStep: state.authStep,
        isNewUser: state.isNewUser,
        sensor: state.sensor,
        history: state.history
      })
    }
  )
);

/* ===== FIREBASE REAL-TIME INTEGRATION (SEBAGAI BACKUP) ===== */
let unsubscribe = null;

export const startSensorStream = () => {

  //return; // KILL SWITCH

  const { isLoggedIn } = useIoTStore.getState();
  if (!isLoggedIn) return;

  const sensorRef = ref(db, 'Irigasiku'); 

  unsubscribe = onValue(sensorRef, (snapshot) => {
    const data = snapshot.val();
    
    if (data) {
      const formattedData = {
        time: Date.now(),
        ph: Number(data.pH) || 0,
        temp: Number(data.Suhu) || 0, 
        turbidity: Number(data.TDS) || 0 
      };

      useIoTStore.getState().setSensorData({
        ph: formattedData.ph,
        temp: formattedData.temp,
        turbidity: formattedData.turbidity
      });

      useIoTStore.getState().addHistory(formattedData);
      
      // 🔥 FIX: Sebelumnya di sini tertulis 'false', aku ubah jadi 'true'
      useIoTStore.getState().setSettings("isConnected", true);
      
      console.log("🔥 Data Real-time Berhasil Masuk:", formattedData);
    }
  }, (error) => {
    console.error("Firebase Error:", error);
    useIoTStore.getState().setSettings("isConnected", false);
  });
};

export const stopSensorStream = () => {
  if (unsubscribe) {
    unsubscribe(); 
    unsubscribe = null;
  }
};

if (useIoTStore.getState().isLoggedIn) {
  startSensorStream();
}

export default useIoTStore;