'use client'

export function Lights() {
  return (
    <>
      {/* Luz ambiental base suave */}
      <ambientLight intensity={0.25} />

      {/* Luz cenital principal con sombras */}
      <directionalLight
        castShadow
        position={[0, 12, 0]}
        intensity={1.2}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      {/* Luces de acento sobre las zonas de productos */}
      <pointLight position={[-4, 4, -4]} color="#ff6a00" intensity={3} distance={8} decay={2} />
      <pointLight position={[4, 4, -4]}  color="#4facfe" intensity={3} distance={8} decay={2} />
      <pointLight position={[-4, 4, 4]}  color="#4facfe" intensity={3} distance={8} decay={2} />
      <pointLight position={[4, 4, 4]}   color="#ff6a00" intensity={3} distance={8} decay={2} />

      {/* Luz de relleno frontal tenue */}
      <pointLight position={[0, 3, 8]} color="#ffffff" intensity={1} distance={12} decay={2} />
    </>
  )
}
