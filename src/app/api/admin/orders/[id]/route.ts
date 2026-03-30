import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase     = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const adminEmails  = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
  const isAdmin      = adminEmails.includes(user.email ?? '') || user.user_metadata?.role === 'admin'
  return isAdmin ? supabase : null
}

// PUT /api/admin/orders/[id] — actualizar estado de orden
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status } = await req.json()

  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
