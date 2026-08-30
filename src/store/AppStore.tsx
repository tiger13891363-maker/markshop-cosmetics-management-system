"use client";

// ─────────────────────────────────────────────────────────────
// Markshop application store.
// Today: mock data + localStorage persistence + simulated
// latency (so loading states feel real).
// Later: swap each action body with a REST / Mixin / DB call —
// the props and hooks stay exactly the same.
// ─────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  Customer,
  NotificationItem,
  Order,
  OrderItem,
  Product,
  Settings,
  ToastItem,
} from "@/lib/types";
import {
  defaultSettings,
  seedCustomers,
  seedOrders,
  seedProducts,
} from "@/lib/mock-data";
import { uid } from "@/lib/format";

const LS_KEY = "markshop:data:v3";
const wait = (ms = 520) => new Promise<void>((r) => setTimeout(r, ms));

interface RegisterInput {
  name: string;
  phone: string;
  items: OrderItem[];
  address?: string;
  notes?: string;
}

interface AppCtx {
  loading: boolean;
  products: Product[];
  customers: Customer[];
  orders: Order[];
  settings: Settings;
  toasts: ToastItem[];
  notifications: NotificationItem[];
  unread: number;
  toast: (type: ToastItem["type"], title: string, message?: string) => void;
  dismissToast: (id: number) => void;
  markAllRead: () => void;
  registerOrder: (input: RegisterInput) => Promise<Order>;
  updateOrder: (id: string, patch: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  addProduct: (p: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCustomer: (c: Omit<Customer, "id" | "registrationDate">) => Promise<void>;
  updateCustomer: (id: string, patch: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  saveSettings: (patch: Partial<Settings>) => Promise<void>;
  resetData: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

function loadPersisted() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d.products || !d.customers || !d.orders) return null;
    return d;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [unread, setUnread] = useState(0);
  const toastSeq = useRef(1);

  // Initial load (simulated fetch)
  useEffect(() => {
    let alive = true;
    (async () => {
      await wait(750);
      const d = loadPersisted();
      if (!alive) return;
      setProducts(d?.products ?? seedProducts);
      setCustomers(d?.customers ?? seedCustomers);
      setOrders(d?.orders ?? seedOrders);
      setSettings({ ...defaultSettings, ...(d?.settings ?? {}) });
      if (d) {
        const recent = (d.orders as Order[]).filter((o) => {
          const h = (Date.now() - new Date(o.date).getTime()) / 36e5;
          return o.status === "new" && h < 72;
        }).length;
        const low = (d.products as Product[]).filter((p) => p.stock > 0 && p.stock < 10).length;
        setUnread(Math.min(recent + low, 9));
      } else {
        setUnread(4);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Persist
  useEffect(() => {
    if (loading) return;
    try {
      window.localStorage.setItem(
        LS_KEY,
        JSON.stringify({ products, customers, orders, settings })
      );
    } catch {
      /* storage full — ignore in mock mode */
    }
  }, [products, customers, orders, settings, loading]);

  // Brand accent
  useEffect(() => {
    document.documentElement.dataset.accent = settings.accent;
  }, [settings.accent]);

  const toast = useCallback(
    (type: ToastItem["type"], title: string, message?: string) => {
      const id = toastSeq.current++;
      setToasts((t) => [...t, { id, type, title, message }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
    },
    []
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const markAllRead = useCallback(() => setUnread(0), []);

  // ── Orders ────────────────────────────────────────────────
  const registerOrder = useCallback(
    async (input: RegisterInput): Promise<Order> => {
      await wait(900);
      let cid = customers.find(
        (c) => c.phone === input.phone.trim()
      )?.id;
      let name = input.name.trim();
      let phone = input.phone.trim();
      if (!cid) {
        cid = uid();
        const nc: Customer = {
          id: cid,
          name,
          phone,
          registrationDate: new Date().toISOString(),
          status: "active",
        };
        setCustomers((cs) => [nc, ...cs]);
      } else {
        const known = customers.find((c) => c.id === cid)!;
        name = known.name;
      }
      const next = orders.reduce(
        (m, o) => Math.max(m, parseInt(o.code.replace(/\D/g, ""), 10) || 0),
        1043
      ) + 1;
      const order: Order = {
        id: uid(),
        code: `MS-${next}`,
        customerId: cid,
        customerName: name,
        customerPhone: phone,
        items: input.items,
        total: input.items.reduce((s, i) => s + i.qty * i.price, 0),
        status: "new",
        date: new Date().toISOString(),
        address: input.address?.trim() || undefined,
        notes: input.notes?.trim() || undefined,
      };
      setOrders((os) => [order, ...os]);
      setProducts((ps) =>
        ps.map((p) => {
          const it = input.items.find((i) => i.productId === p.id);
          return it ? { ...p, stock: Math.max(0, p.stock - it.qty) } : p;
        })
      );
      setUnread((u) => u + 1);
      return order;
    },
    [customers, orders]
  );

  const updateOrder = useCallback(
    async (id: string, patch: Partial<Order>) => {
      await wait();
      setOrders((os) =>
        os.map((o) => (o.id === id ? { ...o, ...patch } : o))
      );
    },
    []
  );

  const deleteOrder = useCallback(
    async (id: string) => {
      await wait();
      setOrders((os) => {
        const target = os.find((o) => o.id === id);
        if (target && target.status !== "cancelled") {
          setProducts((ps) =>
            ps.map((p) => {
              const it = target.items.find((i) => i.productId === p.id);
              return it ? { ...p, stock: p.stock + it.qty } : p;
            })
          );
        }
        return os.filter((o) => o.id !== id);
      });
    },
    []
  );

  // ── Products ──────────────────────────────────────────────
  const addProduct = useCallback(async (p: Omit<Product, "id">) => {
    await wait();
    setProducts((ps) => [{ ...p, id: uid() }, ...ps]);
  }, []);

  const updateProduct = useCallback(
    async (id: string, patch: Partial<Product>) => {
      await wait();
      setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    },
    []
  );

  const deleteProduct = useCallback(async (id: string) => {
    await wait();
    setProducts((ps) => ps.filter((p) => p.id !== id));
  }, []);

  // ── Customers ─────────────────────────────────────────────
  const addCustomer = useCallback(
    async (c: Omit<Customer, "id" | "registrationDate">) => {
      await wait();
      setCustomers((cs) => [
        { ...c, id: uid(), registrationDate: new Date().toISOString() },
        ...cs,
      ]);
    },
    []
  );

  const updateCustomer = useCallback(
    async (id: string, patch: Partial<Customer>) => {
      await wait();
      setCustomers((cs) =>
        cs.map((c) => (c.id === id ? { ...c, ...patch } : c))
      );
    },
    []
  );

  const deleteCustomer = useCallback(async (id: string) => {
    await wait();
    setCustomers((cs) => cs.filter((c) => c.id !== id));
  }, []);

  // ── Settings ──────────────────────────────────────────────
  const saveSettings = useCallback(async (patch: Partial<Settings>) => {
    await wait(400);
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const resetData = useCallback(() => {
    window.localStorage.removeItem(LS_KEY);
    window.location.reload();
  }, []);

  // ── Derived notifications ─────────────────────────────────
  const notifications = useMemo<NotificationItem[]>(() => {
    if (loading) return [];
    const list: NotificationItem[] = [];
    orders
      .filter((o) => (Date.now() - new Date(o.date).getTime()) / 36e5 < 72)
      .slice(0, 5)
      .forEach((o) =>
        list.push({
          id: `n-${o.id}`,
          type: "order",
          title: `سفارش ${o.code} از ${o.customerName} ثبت شد`,
          time: o.date,
        })
      );
    products
      .filter((p) => p.stock > 0 && p.stock < 10)
      .slice(0, 4)
      .forEach((p) =>
        list.push({
          id: `s-${p.id}`,
          type: "stock",
          title: `موجودی «${p.name}» رو به اتمام است`,
          time: new Date().toISOString(),
        })
      );
    return list.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 8);
  }, [orders, products, loading]);

  const value: AppCtx = {
    loading,
    products,
    customers,
    orders,
    settings,
    toasts,
    notifications,
    unread,
    toast,
    dismissToast,
    markAllRead,
    registerOrder,
    updateOrder,
    deleteOrder,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    saveSettings,
    resetData,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
