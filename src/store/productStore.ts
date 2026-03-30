import { create } from 'zustand'
import { Product } from '@/types'

interface ProductStore {
  products: Product[]
  selectedProduct: Product | null
  hoveredProduct: Product | null
  setProducts: (products: Product[]) => void
  selectProduct: (product: Product | null) => void
  setHoveredProduct: (product: Product | null) => void
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  selectedProduct: null,
  hoveredProduct: null,
  setProducts: (products) => set({ products }),
  selectProduct: (product) => set({ selectedProduct: product }),
  setHoveredProduct: (product) => set({ hoveredProduct: product }),
}))
