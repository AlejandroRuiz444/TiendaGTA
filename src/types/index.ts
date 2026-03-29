export interface Product {
  id: string
  name: string
  price: number
  description: string
  image_url: string
  model_url?: string
  position_3d: { x: number; y: number; z: number }
  stock: number
  category: string
  active: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  user_id: string
  items: CartItem[]
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered'
  payment_id?: string
  created_at: string
}
