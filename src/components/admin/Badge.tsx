import { cn } from '@/lib/cn'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default'

const variantMap: Record<BadgeVariant, string> = {
  success: 'bg-green-500/15 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  error:   'bg-red-500/15 text-red-400 border-red-500/30',
  info:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
  default: 'bg-white/10 text-zinc-300 border-white/20',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
      variantMap[variant],
      className,
    )}>
      {children}
    </span>
  )
}

export function orderStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    pending:    'warning',
    paid:       'success',
    shipped:    'info',
    delivered:  'success',
    cancelled:  'error',
  }
  return map[status] ?? 'default'
}
