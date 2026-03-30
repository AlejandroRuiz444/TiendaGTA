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

// POST /api/admin/products — crear producto
export async function POST(req: NextRequest) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('products')
    .insert({
      name:        body.name,
      price:       body.price,
      description: body.description || null,
      category:    body.category,
      stock:       body.stock ?? 0,
      image_url:   body.image_url || null,
      active:      true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
