-- UBER Market / UBER POKJA: sumber data tunggal untuk marketplace dan dashboard.
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','kurir','keuangan','gudang','pemasaran','customer')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expiry ON sessions(expires_at);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL,
  cost_price INTEGER NOT NULL CHECK(cost_price >= 0),
  sale_price INTEGER NOT NULL CHECK(sale_price >= 0),
  stock_on_hand INTEGER NOT NULL DEFAULT 0 CHECK(stock_on_hand >= 0),
  reorder_point INTEGER NOT NULL DEFAULT 0 CHECK(reorder_point >= 0),
  image_key TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  type TEXT NOT NULL CHECK(type IN ('purchase_received','order_fulfilled','adjustment','return')),
  quantity INTEGER NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  note TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_stock_movements_product_created ON stock_movements(product_id, created_at DESC);

CREATE TABLE customer_addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_customer_addresses_user ON customer_addresses(user_id);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL REFERENCES users(id),
  address_id TEXT REFERENCES customer_addresses(id),
  fulfillment_method TEXT NOT NULL CHECK(fulfillment_method IN ('delivery','pickup')),
  payment_method TEXT NOT NULL CHECK(payment_method IN ('transfer','cash')),
  status TEXT NOT NULL CHECK(status IN ('awaiting_payment','payment_verified','processing','shipped','completed','cancelled')),
  subtotal INTEGER NOT NULL CHECK(subtotal >= 0),
  shipping_fee INTEGER NOT NULL DEFAULT 0 CHECK(shipping_fee >= 0),
  total INTEGER NOT NULL CHECK(total >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_customer_created ON orders(customer_id, created_at DESC);
CREATE INDEX idx_orders_status_created ON orders(status, created_at ASC);

CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  unit_price INTEGER NOT NULL CHECK(unit_price >= 0),
  line_total INTEGER NOT NULL CHECK(line_total >= 0)
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  amount INTEGER NOT NULL CHECK(amount > 0),
  method TEXT NOT NULL CHECK(method IN ('transfer','cash')),
  status TEXT NOT NULL CHECK(status IN ('pending','verified','rejected')),
  proof_key TEXT,
  verified_by TEXT REFERENCES users(id),
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status, created_at ASC);

CREATE TABLE cash_entries (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('capital','income','expense')),
  category TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK(amount > 0),
  description TEXT NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_cash_entries_created ON cash_entries(created_at DESC);
