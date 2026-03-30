import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ── Imágenes externas (Supabase Storage + placeholders) ───────────────────
  images: {
    remotePatterns: [
      {
        // Supabase Storage: bjhdbhjexlzsrpjrgbgi.supabase.co/storage/v1/object/...
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        // Placeholder de imágenes en desarrollo
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },

  // ── Headers HTTP de seguridad + CORS para webhooks ────────────────────────
  async headers() {
    return [
      {
        // Headers de seguridad para todas las rutas
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // CORS para endpoints de webhooks (Stripe y MercadoPago llaman desde sus servidores)
        source: '/api/webhooks/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin',  value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, stripe-signature, x-signature, x-request-id' },
        ],
      },
    ]
  },

  // ── Turbopack (Next.js 16 default bundler) ────────────────────────────────
  // Three.js y R3F funcionan out-of-the-box con Turbopack sin config extra
  turbopack: {},
}

export default nextConfig
