'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Store,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const navItems = [
  { title: 'Dashboard',  href: '/admin',          icon: LayoutDashboard },
  { title: 'Productos',  href: '/admin/products',  icon: Package },
  { title: 'Órdenes',    href: '/admin/orders',    icon: ShoppingCart },
]

export default function AdminSidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    )
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-[#0d0d1f] border-r border-white/10 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-white/10',
        collapsed && 'justify-center px-0',
      )}>
        <span className="text-[#ff6a00] text-xl font-black shrink-0">G</span>
        {!collapsed && (
          <span className="text-white font-black text-sm tracking-widest">
            TIENDA<span className="text-[#ff6a00]">GTA</span>
            <span className="block text-[10px] text-zinc-500 font-normal tracking-normal">
              Admin Panel
            </span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ title, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-[#ff6a00]/15 text-[#ff6a00] border border-[#ff6a00]/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5',
                collapsed && 'justify-center px-0',
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-2 space-y-1">
        <Link
          href="/store"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all',
            collapsed && 'justify-center px-0',
          )}
        >
          <Store size={18} className="shrink-0" />
          {!collapsed && <span>Ver tienda</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all',
            collapsed && 'justify-center px-0',
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-[#ff6a00] text-white flex items-center justify-center shadow-lg hover:bg-[#ff8c38] transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
