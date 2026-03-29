'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

type PayStatus = 'success' | 'pending' | 'error'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId      = searchParams.get('orderId')
  const method       = searchParams.get('method')   // 'stripe' | 'mp' | null
  const status       = searchParams.get('status')   // 'pending' | null (MercadoPago pending)

  const [show, setShow] = useState(false)

  // Determinar el estado visual
  const payStatus: PayStatus =
    status === 'pending'
      ? 'pending'
      : (method === 'stripe' || method === 'mp' || !method)
        ? 'success'
        : 'success'

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300)
    return () => clearTimeout(t)
  }, [])

  const config = {
    success: {
      icon:        '✓',
      iconColor:   'bg-green-500/20 border-green-500',
      title:       '¡Pedido Confirmado!',
      subtitle:    'Tu pago fue procesado exitosamente.',
      methodLabel: method === 'stripe' ? '💳 Stripe' : method === 'mp' ? '🏦 MercadoPago' : '',
    },
    pending: {
      icon:        '⏳',
      iconColor:   'bg-yellow-500/20 border-yellow-500',
      title:       'Pago en proceso',
      subtitle:    'Tu pago está siendo verificado. Te notificaremos por email.',
      methodLabel: '🏦 MercadoPago',
    },
    error: {
      icon:        '✕',
      iconColor:   'bg-red-500/20 border-red-500',
      title:       'Pago no completado',
      subtitle:    'Hubo un problema con tu pago. Intenta de nuevo.',
      methodLabel: '',
    },
  }[payStatus]

  return (
    <main className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center text-white px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0f3460] to-[#533483] opacity-40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={show ? { opacity: 1, scale: 1 } : {}}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10 flex flex-col items-center gap-6 text-center max-w-md w-full"
      >
        {/* Ícono */}
        <motion.div
          initial={{ scale: 0 }}
          animate={show ? { scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
          className={`w-24 h-24 rounded-full border-2 flex items-center justify-center ${config.iconColor}`}
        >
          <span className="text-5xl">{config.icon}</span>
        </motion.div>

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-4xl font-black mb-2">{config.title}</h1>
          <p className="text-zinc-400">{config.subtitle}</p>
          {config.methodLabel && (
            <p className="text-zinc-500 text-sm mt-1">
              Método de pago: <span className="text-zinc-300">{config.methodLabel}</span>
            </p>
          )}
        </motion.div>

        {/* ID de orden */}
        {orderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={show ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 w-full"
          >
            <p className="text-zinc-400 text-xs uppercase tracking-widest mb-1">
              Número de orden
            </p>
            <p className="text-white font-mono text-sm break-all">{orderId}</p>
          </motion.div>
        )}

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="space-y-2 text-sm text-zinc-400"
        >
          {payStatus === 'success' && (
            <>
              <p>📦 Recibirás un email con los detalles de tu pedido.</p>
              <p>🚚 Tiempo de entrega estimado: 3-5 días hábiles.</p>
            </>
          )}
          {payStatus === 'pending' && (
            <>
              <p>📧 Recibirás una confirmación por email cuando se acredite.</p>
              <p>⏱️ El proceso puede demorar hasta 2 días hábiles.</p>
            </>
          )}
        </motion.div>

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1 }}
          className="flex flex-col gap-3 w-full"
        >
          <Link
            href="/store"
            className="w-full py-4 bg-[#ff6a00] hover:bg-[#ff8c38] text-white font-black text-center rounded-xl transition-colors shadow-lg hover:shadow-[0_0_20px_rgba(255,106,0,0.4)]"
          >
            Seguir explorando la tienda
          </Link>
          <Link
            href="/"
            className="w-full py-3 text-zinc-400 hover:text-white text-center text-sm transition-colors"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-white text-xl font-bold animate-pulse">Cargando...</div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}
