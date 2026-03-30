-- ============================================================
-- TiendaGTA — Schema SQL
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── TABLA PRODUCTOS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  price        DECIMAL(10, 2) NOT NULL,
  description  TEXT,
  image_url    TEXT,
  model_url    TEXT,
  position_3d  JSONB NOT NULL DEFAULT '{"x": 0, "y": 0.55, "z": 0}',
  stock        INTEGER NOT NULL DEFAULT 0,
  category     TEXT NOT NULL DEFAULT 'default',
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABLA ORDENES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  items         JSONB NOT NULL DEFAULT '[]',
  total         DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_data JSONB,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  payment_id    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders   ENABLE ROW LEVEL SECURITY;

-- Productos: lectura pública para productos activos
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (active = true);

-- Órdenes: cada usuario solo ve las suyas
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── SEED: 5 PRODUCTOS DE EJEMPLO ─────────────────────────────
INSERT INTO products (name, price, description, image_url, position_3d, stock, category) VALUES
(
  'Chaqueta Rockstar',
  89.99,
  'Chaqueta de cuero estilo GTA. Edición limitada con logo bordado.',
  '',
  '{"x": -5, "y": 0.55, "z": -8}',
  10,
  'ropa'
),
(
  'Zapatos Grove St.',
  59.99,
  'Sneakers exclusivos del barrio más icónico de San Andreas.',
  '',
  '{"x": 5, "y": 0.55, "z": -8}',
  5,
  'calzado'
),
(
  'Gorra Los Santos',
  29.99,
  'Gorra snapback con el escudo oficial de Los Santos.',
  '',
  '{"x": -5, "y": 0.55, "z": 0}',
  20,
  'accesorios'
),
(
  'Reloj Maze Bank',
  149.99,
  'Reloj de lujo con el logo de Maze Bank. Resistente al agua.',
  '',
  '{"x": 5, "y": 0.55, "z": 0}',
  3,
  'accesorios'
),
(
  'Cadena Vinewood',
  199.99,
  'Cadena de oro con dije de la estrella de Vinewood. Edición VIP.',
  '',
  '{"x": 0, "y": 1.65, "z": -6}',
  2,
  'joyeria'
);
