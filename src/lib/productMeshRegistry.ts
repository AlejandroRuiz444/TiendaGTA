import * as THREE from 'three'

// Registro global de meshes de productos.
// Evita scene.traverse() en cada frame — O(1) lookup vs O(n) traversal.
const registry = new Map<string, THREE.Mesh>()

export const productMeshRegistry = {
  register(productId: string, mesh: THREE.Mesh) {
    registry.set(productId, mesh)
  },
  unregister(productId: string) {
    registry.delete(productId)
  },
  getMeshes(): THREE.Mesh[] {
    return Array.from(registry.values())
  },
  getProductIdByMesh(mesh: THREE.Mesh): string | null {
    for (const [id, m] of registry.entries()) {
      if (m === mesh) return id
    }
    return null
  },
}
