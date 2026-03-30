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

// PUT /api/admin/products/[id] — actualizar producto
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id }   = await params
  const body     = await req.json()

  // Solo actualizar campos enviados
  const updates: Record<string, unknown> = {}
  if (body.name        !== undefined) updates.name        = body.name
  if (body.price       !== undefined) updates.price       = body.price
  if (body.description !== undefined) updates.description = body.description || null
  if (body.category    !== undefined) updates.category    = body.category
  if (body.stock       !== undefined) updates.stock       = body.stock
  if (body.image_url   !== undefined) updates.image_url   = body.image_url || null
  if (body.active      !== undefined) updates.active      = body.active

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/admin/products/[id] — eliminar producto
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
