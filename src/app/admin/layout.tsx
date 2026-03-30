import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Admin — TiendaGTA',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: claimsData } = await supabase.auth.getClaims()
  if (!claimsData?.claims) {
    redirect('/login?next=/admin')
  }

  // Verificar rol admin (email en variable de entorno o metadata)
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
  const isAdmin =
    adminEmails.includes(user?.email ?? '') ||
    user?.user_metadata?.role === 'admin'

  if (!isAdmin) {
    redirect('/?error=unauthorized')
  }

  return (
    <div className="flex h-screen bg-[#0a0a1a] text-white overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
