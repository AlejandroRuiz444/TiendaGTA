'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { createOrder, ShippingData } from '@/lib/orders'

type PaymentMethod = 'stripe' | 'mercadopago'

const INITIAL_FORM: ShippingData = {
  fullName: '',
  email:    '',
  address:  '',
  city:     '',
  country:  'Colombia',
  zipCode:  '',
}

export default function CheckoutPage() {
  const router         = useRouter()
  const items          = useCartStore(s => s.items)
  const total          = useCartStore(s => s.total)
  const clearCart      = useCartStore(s => s.clearCart)
  const [form, setForm]             = useState<ShippingData>(INITIAL_FORM)
  const [payMethod, setPayMethod]   = useState<PaymentMethod>('stripe')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const shipping   = total > 150 ? 0 : 12.99
  const grandTotal = total + shipping

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return
    setLoading(true)
    setError(null)

    // 1. Crear orden en Supabase
    const { orderId, error: orderError } = await createOrder({
      items,
      total: grandTotal,
      shippingData: form,
    })

    if (orderError || !orderId) {
      setError(orderError ?? 'Error al registrar el pedido')
      setLoading(false)
      return
    }

    try {
      if (payMethod === 'stripe') {
        // 2a. Crear PaymentIntent en Stripe
        const res = await fetch('/api/payments/stripe', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ amount: grandTotal, orderId }),
        })
        const { clientSecret, error: stripeError } = await res.json()

        if (stripeError || !clientSecret) {
          throw new Error(stripeError ?? 'Error Stripe')
        }

        // Redirigir a la página de pago con Stripe Elements
        clearCart()
        router.push(`/checkout/payment?clientSecret=${clientSecret}&orderId=${orderId}&method=stripe`)

      } else {
        // 2b. Crear preferencia en MercadoPago
        const res = await fetch('/api/payments/mercadopago', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ items, orderId, email: form.email }),
        })
        const { initPoint, error: mpError } = await res.json()

        if (mpError || !initPoint) {
          throw new Error(mpError ?? 'Error MercadoPago')
        }

        // Redirigir al checkout de MercadoPago
        clearCart()
        window.location.href = initPoint
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#0a0a1a] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <span className="text-6xl">🛒</span>
          <h2 className="text-2xl font-black">Carrito vacío</h2>
          <Link href="/store" className="block px-8 py-3 bg-[#ff6a00] rounded-full font-bold">
            Ir a la tienda
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-black">
            TIENDA<span className="text-[#ff6a00]">GTA</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="text-zinc-600">Carrito</span>
            <span>→</span>
            <span className="text-white font-bold">Checkout</span>
            <span>→</span>
            <span className="text-zinc-600">Pago</span>
          </div>
          <Link href="/cart" className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← Volver al carrito
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Formulario ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Datos de envío */}
              <h2 className="text-xl font-black">Datos de envío</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <Field label="Nombre completo" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Juan García" required />
                <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" required />
                <Field label="Dirección" name="address" value={form.address} onChange={handleChange} placeholder="Calle 123 # 45-67" required />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Ciudad" name="city" value={form.city} onChange={handleChange} placeholder="Bogotá" required />
                  <Field label="Código postal" name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="110111" required />
                </div>
                <div>
                  <label className="text-zinc-400 text-xs font-medium mb-1 block">País</label>
                  <select name="country" value={form.country} onChange={handleChange}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff6a00] transition-colors">
                    <option>Colombia</option>
                    <option>México</option>
                    <option>Argentina</option>
                    <option>Chile</option>
                    <option>Perú</option>
                    <option>España</option>
                    <option>Estados Unidos</option>
                  </select>
                </div>
              </div>

              {/* Método de pago */}
              <h2 className="text-xl font-black">Método de pago</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">

                {/* Stripe */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  payMethod === 'stripe'
                    ? 'border-[#ff6a00]/60 bg-[#ff6a00]/10'
                    : 'border-white/10 hover:border-white/20'
                }`}>
                  <input type="radio" name="payMethod" value="stripe"
                    checked={payMethod === 'stripe'}
                    onChange={() => setPayMethod('stripe')}
                    className="accent-[#ff6a00]" />
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">💳 Tarjeta de crédito / débito</p>
                    <p className="text-zinc-400 text-xs mt-0.5">Visa, Mastercard, Amex — powered by Stripe</p>
                  </div>
                  <div className="flex gap-1">
                    {['VISA', 'MC', 'AMEX'].map(c => (
                      <span key={c} className="text-xs px-2 py-1 bg-zinc-800 rounded font-mono text-zinc-400">{c}</span>
                    ))}
                  </div>
                </label>

                {/* MercadoPago */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  payMethod === 'mercadopago'
                    ? 'border-[#00b1ea]/60 bg-[#00b1ea]/10'
                    : 'border-white/10 hover:border-white/20'
                }`}>
                  <input type="radio" name="payMethod" value="mercadopago"
                    checked={payMethod === 'mercadopago'}
                    onChange={() => setPayMethod('mercadopago')}
                    className="accent-[#00b1ea]" />
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">🏦 MercadoPago</p>
                    <p className="text-zinc-400 text-xs mt-0.5">PSE, Nequi, Daviplata, efectivo — LATAM</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-[#00b1ea]/20 text-[#00b1ea] rounded font-bold">MP</span>
                </label>

                <p className="text-zinc-600 text-xs text-center pt-1">
                  🔒 Pago seguro — tus datos están protegidos
                </p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </motion.div>
              )}
            </div>

            {/* ── Resumen ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="font-black">Resumen</h2>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-zinc-400 truncate mr-2">
                        {item.product.name}
                        <span className="text-zinc-600 ml-1">x{item.quantity}</span>
                      </span>
                      <span className="text-white flex-shrink-0">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span className="text-white">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Envío</span>
                    <span className={shipping === 0 ? 'text-green-400 font-bold' : 'text-white'}>
                      {shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-[#ff6a00] font-black text-2xl">${grandTotal.toFixed(2)}</span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 font-black rounded-xl transition-colors shadow-lg disabled:bg-zinc-700 disabled:text-zinc-500 text-white ${
                    payMethod === 'stripe'
                      ? 'bg-[#ff6a00] hover:bg-[#ff8c38]'
                      : 'bg-[#00b1ea] hover:bg-[#00d2ff]'
                  }`}
                >
                  {loading
                    ? 'Procesando...'
                    : payMethod === 'stripe'
                      ? `💳 Pagar $${grandTotal.toFixed(2)}`
                      : `🏦 Pagar con MercadoPago`
                  }
                </motion.button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}

function Field({ label, name, value, onChange, placeholder, required = false, type = 'text' }: {
  label: string; name: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string; required?: boolean; type?: string
}) {
  return (
    <div>
      <label className="text-zinc-400 text-xs font-medium mb-1 block">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#ff6a00] transition-colors" />
    </div>
  )
}
