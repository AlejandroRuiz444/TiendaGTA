import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

// POST /api/payments/stripe — crear PaymentIntent
export async function POST(request: Request) {
  try {
    const { amount, orderId, currency = 'usd' } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(amount * 100), // Stripe trabaja en centavos
      currency,
      metadata: { orderId: orderId ?? '' },
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (err) {
    console.error('[POST /api/payments/stripe]', err)
    return NextResponse.json({ error: 'Error al crear PaymentIntent' }, { status: 500 })
  }
}
