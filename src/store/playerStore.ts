import { create } from 'zustand'

interface PlayerStore {
  isInsideStore: boolean
  isPointerLocked: boolean
  setInsideStore: (value: boolean) => void
  setPointerLocked: (value: boolean) => void
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  isInsideStore: false,
  isPointerLocked: false,
  setInsideStore: (value) => set({ isInsideStore: value }),
  setPointerLocked: (value) => set({ isPointerLocked: value }),
}))
