import { create } from "zustand"

const useIoTStore = create((set) => ({
  sensor: {
    ph: 7,
    temp: 26,
    turbidity: 15,
  },

  notifications: [],

  setSensorData: (data) =>
    set({
      sensor: data,
    }),

  addNotification: (notif) =>
    set((state) => ({
      notifications: [notif, ...state.notifications],
    })),
}))

export default useIoTStore