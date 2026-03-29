import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/orders — crear una orden (autenticado o invitado)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { items, total, shippingData, userId } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items inválidos' }, { status: 400 })
    }

    // Usar SERVICE_ROLE para insertar (permite órdenes de invitados)
    const { createClient: createAdmin } = await import('@supabase/supabase-js')
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await admin
      .from('orders')
      .insert({
        user_id:       userId ?? null,
        items,
        total,
        shipping_data: shippingData,
        status:        'pending',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/orders]', err)
    return NextResponse.json({ error: 'Error al crear orden' }, { status: 500 })
  }
}

// GET /api/orders — listar órdenes del usuario autenticado
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: claimsData2, error: authError } = await supabase.auth.getClaims()
    if (authError || !claimsData2) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const { claims } = claimsData2

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', claims.sub)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/orders]', err)
    return NextResponse.json({ error: 'Error al obtener órdenes' }, { status: 500 })
  }
}
