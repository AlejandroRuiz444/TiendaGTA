import { createClient } from '@/lib/supabase/client'
import { CartItem } from '@/types'

export interface CreateOrderPayload {
  items: CartItem[]
  total: number
  shippingData: ShippingData
}

export interface ShippingData {
  fullName:  string
  email:     string
  address:   string
  city:      string
  country:   string
  zipCode:   string
}

export interface OrderResult {
  orderId: string | null
  error:   string | null
}

// Crea una orden en Supabase vía API route
export async function createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    // Si no hay sesión autenticada, crear orden como invitado via API
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: payload.items.map(i => ({
          productId:   i.product.id,
          productName: i.product.name,
          price:       i.product.price,
          quantity:    i.quantity,
        })),
        total:        payload.total,
        shippingData: payload.shippingData,
        userId:       session?.user?.id ?? null,
      }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      return { orderId: null, error: error ?? 'Error al crear orden' }
    }

    const { data } = await res.json()
    return { orderId: data.id, error: null }
  } catch (err) {
    console.error('[createOrder]', err)
    return { orderId: null, error: 'Error de conexión' }
  }
}
