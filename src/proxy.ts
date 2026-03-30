import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

// En Next.js 16 el archivo se llama proxy.ts (antes middleware.ts)
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Aplica a todas las rutas excepto assets estáticos e imágenes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
