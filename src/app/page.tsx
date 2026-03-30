import Link from 'next/link'

export default function Home() {
  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center bg-[#0a0a1a] overflow-hidden">
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0f3460] to-[#533483] opacity-60 pointer-events-none" />

      {/* Contenido centrado */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-8">
        <h1 className="text-6xl font-black tracking-tight text-white drop-shadow-lg">
          TIENDA<span className="text-[#ff6a00]">GTA</span>
        </h1>
        <p className="text-lg text-zinc-300 max-w-md">
          Explora nuestra tienda en un entorno 3D inmersivo. Navega, interactua con productos y compra como si estuvieras ahí.
        </p>

        <Link
          href="/store"
          className="mt-4 px-10 py-4 bg-[#ff6a00] hover:bg-[#ff8c38] text-white font-bold text-lg rounded-full transition-all duration-200 shadow-lg hover:shadow-[0_0_30px_rgba(255,106,0,0.5)] active:scale-95"
        >
          ENTRAR A LA TIENDA
        </Link>

        <p className="text-zinc-500 text-sm mt-2">
          Usa WASD para moverte · Mouse para mirar · Click para interactuar
        </p>
      </div>
    </main>
  )
}
