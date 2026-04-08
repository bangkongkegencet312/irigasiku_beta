import { create } from "zustand"

const useIoTStore = create((set) => ({
  sensor: {
    ph: 7,
    temp: 26,
    turbidity: 15,
  },

  setSensorData: (data) =>
    set({
      sensor: data,
    }),
}))

export default useIoTStore