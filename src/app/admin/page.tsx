import { createClient } from '@/lib/supabase/server'
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'
import Badge, { orderStatusBadge } from '@/components/admin/Badge'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Cargar datos en paralelo
  const [productsRes, ordersRes] = await Promise.all([
    supabase.from('products').select('id, active, stock').eq('active', true),
    supabase.from('orders').select('id, total, status, created_at').order('created_at', { ascending: false }),
  ])

  const products = productsRes.data ?? []
  const orders   = ordersRes.data ?? []

  const totalRevenue  = orders.filter(o => o.status === 'paid' || o.status === 'delivered').reduce((s, o) => s + (o.total ?? 0), 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const recentOrders  = orders.slice(0, 5)

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Bienvenido al panel de administración de TiendaGTA</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Productos activos"
          value={products.length}
          subtitle="En inventario"
          icon={Package}
          color="orange"
        />
        <StatsCard
          title="Órdenes totales"
          value={orders.length}
          subtitle={`${pendingOrders} pendientes`}
          icon={ShoppingCart}
          color="blue"
        />
        <StatsCard
          title="Ingresos totales"
          value={`$${totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`}
          subtitle="Órdenes pagadas"
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Stock bajo"
          value={products.filter(p => (p.stock ?? 0) < 5).length}
          subtitle="Requieren atención"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Últimas órdenes */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-bold">Últimas órdenes</h2>
          <Link href="/admin/orders" className="text-[#ff6a00] text-sm hover:underline">
            Ver todas →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-6 py-10 text-center text-zinc-500">
            No hay órdenes aún
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-zinc-400 font-medium">ID</th>
                  <th className="px-6 py-3 text-left text-zinc-400 font-medium">Estado</th>
                  <th className="px-6 py-3 text-right text-zinc-400 font-medium">Total</th>
                  <th className="px-6 py-3 text-left text-zinc-400 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-6 py-3 font-mono text-zinc-400 text-xs">{order.id.slice(0, 8)}…</td>
                    <td className="px-6 py-3">
                      <Badge variant={orderStatusBadge(order.status)}>{order.status}</Badge>
                    </td>
                    <td className="px-6 py-3 text-right font-bold">${order.total?.toLocaleString('es-AR')}</td>
                    <td className="px-6 py-3 text-zinc-400">
                      {new Date(order.created_at).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
