'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import PaymentForm from './PaymentForm'

function PaymentPageContent() {
  const searchParams  = useSearchParams()
  const clientSecret  = searchParams.get('clientSecret') ?? ''
  const orderId       = searchParams.get('orderId') ?? ''

  if (!clientSecret) {
    return (
      <main className="min-h-screen bg-[#0a0a1a] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-xl font-black">Sesión de pago inválida</h2>
          <Link href="/cart" className="block px-8 py-3 bg-[#ff6a00] rounded-full font-bold">
            Volver al carrito
          </Link>
        </div>
      </main>
    )
  }

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#ff6a00',
      colorBackground: '#18181b',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '12px',
    },
  }

  return (
    <main className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-black">
            TIENDA<span className="text-[#ff6a00]">GTA</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="text-zinc-600">Carrito</span>
            <span>→</span>
            <span className="text-zinc-600">Checkout</span>
            <span>→</span>
            <span className="text-white font-bold">Pago</span>
          </div>
          <div className="w-28" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-black">Completa tu pago</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Pago seguro con <span className="text-[#ff6a00] font-bold">Stripe</span>
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <Elements
            stripe={getStripe()}
            options={{
              clientSecret,
              appearance,
            }}
          >
            <PaymentForm orderId={orderId} />
          </Elements>
        </div>

        <p className="text-zinc-600 text-xs text-center">
          🔒 Conexión cifrada SSL · Datos procesados por Stripe · PCI DSS compliant
        </p>
      </div>
    </main>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-white text-xl font-bold animate-pulse">Cargando pasarela de pago...</div>
      </main>
    }>
      <PaymentPageContent />
    </Suspense>
  )
}
