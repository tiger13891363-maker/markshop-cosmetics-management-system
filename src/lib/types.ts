// ─────────────────────────────────────────────────────────────
// Markshop — Domain types
// These types mirror the future REST API / database contract.
// When a real backend is connected, only the data-access layer
// (src/store/AppStore.tsx) changes — not the UI.
// ─────────────────────────────────────────────────────────────

export type OrderStatus =
  | "new"
  | "processing"
  | "ready"
  | "shipped"
  | "completed"
  | "cancelled";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  status: "active" | "archived";
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  registrationDate: string;
  status: "active" | "inactive";
  notes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  address?: string;
  notes?: string;
}

export type Accent = "classic" | "royal" | "azure";

export interface Settings {
  shopName: string;
  tagline: string;
  phone: string;
  address: string;
  logo: string; // data URL or empty
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  notNewOrder: boolean;
  notLowStock: boolean;
  notDailySummary: boolean;
  accent: Accent;
  goldAccent: boolean;
  // Future integrations (structure only — nothing is connected yet)
  restUrl: string;
  restToken: string;
  dbUrl: string;
  dbUser: string;
  dbPass: string;
  mixUrl: string;
  mixToken: string;
}

export interface ToastItem {
  id: number;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
}

export interface NotificationItem {
  id: string;
  type: "order" | "stock";
  title: string;
  time: string;
}
