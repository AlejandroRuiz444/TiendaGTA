import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Desactivar el body parser — Stripe necesita el body crudo para validar la firma
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body      = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    )
  } catch (err) {
    console.error('[Webhook Stripe] Firma inválida:', err)
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
  }

  // Actualizar orden cuando el pago es exitoso
  if (event.type === 'payment_intent.succeeded') {
    const intent  = event.data.object as Stripe.PaymentIntent
    const orderId = intent.metadata?.orderId

    if (orderId) {
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { error } = await admin
        .from('orders')
        .update({ status: 'paid', payment_id: intent.id })
        .eq('id', orderId)

      if (error) {
        console.error('[Webhook Stripe] Error actualizando orden:', error)
      } else {
        console.log(`[Webhook Stripe] Orden ${orderId} marcada como pagada ✓`)
      }
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent  = event.data.object as Stripe.PaymentIntent
    const orderId = intent.metadata?.orderId
    if (orderId) {
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await admin.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
    }
  }

  return NextResponse.json({ received: true })
}
