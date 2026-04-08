import { create } from "zustand"

const useIoTStore = create((set) => ({

  sensor: {
    ph: 7,
    temp: 26,
    turbidity: 15,
  },

  history: [],

  setSensorData: (data) =>
    set({
      sensor: data,
    }),

  addHistory: (data) =>
    set((state) => ({
      history: [
        {
          ...data,
          timestamp: new Date().toISOString() // 🔥 CORE FIX
        },
        ...state.history
      ].slice(0, 100)
    })),
}))

export default useIoTStore