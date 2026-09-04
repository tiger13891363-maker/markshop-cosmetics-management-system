"use client";

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

import { defaultSettings } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

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
  addCustomer: (
    c: Omit<Customer, "id" | "registrationDate">
  ) => Promise<void>;
  updateCustomer: (id: string, patch: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  saveSettings: (patch: Partial<Settings>) => Promise<void>;
  resetData: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useApp must be used inside <AppProvider>");
  }
  return ctx;
}

function productFromDb(row: any): Product {
  return {
    id: String(row.id),
    name: row.name ?? "",
    category: row.category ?? "سایر",
    price: Number(row.price ?? 0),
    stock: Number(row.stock ?? 0),
    image: row.image_url ?? "",
    status: row.status === "archived" ? "archived" : "active",
    description: row.description ?? undefined,
  };
}

function customerFromDb(row: any): Customer {
  return {
    id: String(row.id),
    name: row.name ?? "",
    phone: row.phone ?? "",
    registrationDate: row.created_at ?? new Date().toISOString(),
    status: "active",
  };
}

function orderFromDb(row: any, items: OrderItem[] = []): Order {
  return {
    id: String(row.id),
    code: `MS-${row.id}`,
    customerId: "",
    customerName: row.customer_name ?? "",
    customerPhone: row.phone ?? "",
    items,
    total: Number(row.total ?? 0),
    status: row.status ?? "new",
    date: row.created_at ?? new Date().toISOString(),
    address: row.address ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [unread, setUnread] = useState(0);
  const toastSeq = useRef(1);

  const toast = useCallback(
    (type: ToastItem["type"], title: string, message?: string) => {
      const id = toastSeq.current++;
      setToasts((t) => [...t, { id, type, title, message }]);

      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 4200);
    },
    []
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setUnread(0);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [
        productsResult,
        customersResult,
        ordersResult,
        itemsResult,
      ] = await Promise.all([
        supabase.from("products").select("*").order("id", { ascending: false }),
        supabase.from("customers").select("*").order("id", { ascending: false }),
        supabase.from("orders").select("*").order("id", { ascending: false }),
        supabase.from("order_items").select("*").order("id", { ascending: true }),
      ]);

      if (productsResult.error) {
        throw new Error(productsResult.error.message);
      }

      if (customersResult.error) {
        throw new Error(customersResult.error.message);
      }

      if (ordersResult.error) {
        throw new Error(ordersResult.error.message);
      }

      if (itemsResult.error) {
        throw new Error(itemsResult.error.message);
      }

      const dbProducts = (productsResult.data ?? []).map(productFromDb);
      const dbCustomers = (customersResult.data ?? []).map(customerFromDb);
      const dbItems = itemsResult.data ?? [];

      const dbOrders = (ordersResult.data ?? []).map((row: any) => {
        const items: OrderItem[] = dbItems
          .filter((item: any) => String(item.order_id) === String(row.id))
          .map((item: any) => {
            const product = dbProducts.find(
              (p) => String(p.id) === String(item.product_id)
            );

            return {
              productId: String(item.product_id),
              name: product?.name ?? "محصول",
              qty: Number(item.quantity ?? 1),
              price: Number(item.price ?? 0),
            };
          });

        return orderFromDb(row, items);
      });

      setProducts(dbProducts);
      setCustomers(dbCustomers);
      setOrders(dbOrders);

      const recent = dbOrders.filter((o) => {
        const hours =
          (Date.now() - new Date(o.date).getTime()) / 36e5;
        return o.status === "new" && hours < 72;
      }).length;

      const low = dbProducts.filter(
        (p) => p.stock > 0 && p.stock < 10
      ).length;

      setUnread(Math.min(recent + low, 9));
    } catch (error) {
      console.error("Supabase load error:", error);
      toast(
        "error",
        "خطا در اتصال به پایگاه داده",
        error instanceof Error ? error.message : "خطای نامشخص"
      );
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    document.documentElement.dataset.accent = settings.accent;
  }, [settings.accent]);

  const registerOrder = useCallback(
    async (input: RegisterInput): Promise<Order> => {
      const phone = input.phone.trim();
      const name = input.name.trim();

      let customer = customers.find((c) => c.phone === phone);

      if (!customer) {
        const { data, error } = await supabase
          .from("customers")
          .insert({
            name,
            phone,
            address: input.address?.trim() || null,
          })
          .select()
          .single();

        if (error) throw new Error(error.message);

        customer = customerFromDb(data);
        setCustomers((cs) => [customer!, ...cs]);
      }

      const total = input.items.reduce(
        (sum, item) => sum + item.qty * item.price,
        0
      );

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: name,
          phone,
          address: input.address?.trim() || null,
          total,
          status: "new",
          notes: input.notes?.trim() || null,
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(orderError.message);
      }

      const orderId = orderData.id;

      const rows = input.items.map((item) => ({
        order_id: orderId,
        product_id: Number(item.productId),
        quantity: item.qty,
        price: item.price,
      }));

      if (rows.length) {
        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(rows);

        if (itemsError) {
          await supabase.from("orders").delete().eq("id", orderId);
          throw new Error(itemsError.message);
        }
      }

      for (const item of input.items) {
        const product = products.find(
          (p) => String(p.id) === String(item.productId)
        );

        if (product) {
          const newStock = Math.max(0, product.stock - item.qty);

          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", Number(product.id));
        }
      }

      const order: Order = {
        id: String(orderData.id),
        code: `MS-${orderData.id}`,
        customerId: String(customer!.id),
        customerName: name,
        customerPhone: phone,
        items: input.items,
        total,
        status: "new",
        date: orderData.created_at,
        address: input.address?.trim() || undefined,
        notes: input.notes?.trim() || undefined,
      };

      setOrders((os) => [order, ...os]);

      setProducts((ps) =>
        ps.map((p) => {
          const item = input.items.find(
            (i) => String(i.productId) === String(p.id)
          );

          return item
            ? { ...p, stock: Math.max(0, p.stock - item.qty) }
            : p;
        })
      );

      setUnread((u) => u + 1);

      return order;
    },
    [customers, products]
  );

  const updateOrder = useCallback(
    async (id: string, patch: Partial<Order>) => {
      const dbPatch: any = {};

      if (patch.customerName !== undefined) {
        dbPatch.customer_name = patch.customerName;
      }

      if (patch.customerPhone !== undefined) {
        dbPatch.phone = patch.customerPhone;
      }

      if (patch.address !== undefined) {
        dbPatch.address = patch.address || null;
      }

      if (patch.total !== undefined) {
        dbPatch.total = patch.total;
      }

      if (patch.status !== undefined) {
        dbPatch.status = patch.status;
      }

      if (patch.notes !== undefined) {
        dbPatch.notes = patch.notes || null;
      }

      const { error } = await supabase
        .from("orders")
        .update(dbPatch)
        .eq("id", Number(id));

      if (error) throw new Error(error.message);

      setOrders((os) =>
        os.map((o) => (o.id === id ? { ...o, ...patch } : o))
      );
    },
    []
  );

  const deleteOrder = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", Number(id));

      if (error) throw new Error(error.message);

      setOrders((os) => os.filter((o) => o.id !== id));
    },
    []
  );

  const addProduct = useCallback(
    async (p: Omit<Product, "id">) => {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: p.name,
          category: p.category,
          price: p.price,
          stock: p.stock,
          image_url: p.image || null,
          status: p.status,
          description: p.description || null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      setProducts((ps) => [productFromDb(data), ...ps]);
    },
    []
  );

  const updateProduct = useCallback(
    async (id: string, patch: Partial<Product>) => {
      const dbPatch: any = {};

      if (patch.name !== undefined) dbPatch.name = patch.name;
      if (patch.category !== undefined) dbPatch.category = patch.category;
      if (patch.price !== undefined) dbPatch.price = patch.price;
      if (patch.stock !== undefined) dbPatch.stock = patch.stock;
      if (patch.image !== undefined) {
        dbPatch.image_url = patch.image || null;
      }
      if (patch.status !== undefined) dbPatch.status = patch.status;
      if (patch.description !== undefined) {
        dbPatch.description = patch.description || null;
      }

      const { data, error } = await supabase
        .from("products")
        .update(dbPatch)
        .eq("id", Number(id))
        .select()
        .single();

      if (error) throw new Error(error.message);

      const updated = productFromDb(data);

      setProducts((ps) =>
        ps.map((p) => (p.id === id ? updated : p))
      );
    },
    []
  );

  const deleteProduct = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", Number(id));

    if (error) throw new Error(error.message);

    setProducts((ps) => ps.filter((p) => p.id !== id));
  }, []);

  const addCustomer = useCallback(
    async (
      c: Omit<Customer, "id" | "registrationDate">
    ) => {
      const { data, error } = await supabase
        .from("customers")
        .insert({
          name: c.name,
          phone: c.phone,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      setCustomers((cs) => [customerFromDb(data), ...cs]);
    },
    []
  );

  const updateCustomer = useCallback(
    async (id: string, patch: Partial<Customer>) => {
      const dbPatch: any = {};

      if (patch.name !== undefined) dbPatch.name = patch.name;
      if (patch.phone !== undefined) dbPatch.phone = patch.phone;

      const { data, error } = await supabase
        .from("customers")
        .update(dbPatch)
        .eq("id", Number(id))
        .select()
        .single();

      if (error) throw new Error(error.message);

      const updated = customerFromDb(data);

      setCustomers((cs) =>
        cs.map((c) => (c.id === id ? updated : c))
      );
    },
    []
  );

  const deleteCustomer = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", Number(id));

    if (error) throw new Error(error.message);

    setCustomers((cs) => cs.filter((c) => c.id !== id));
  }, []);

  const saveSettings = useCallback(
    async (patch: Partial<Settings>) => {
      setSettings((s) => ({ ...s, ...patch }));
    },
    []
  );

  const resetData = useCallback(() => {
    loadData();
  }, [loadData]);

  const notifications = useMemo<NotificationItem[]>(() => {
    if (loading) return [];

    const list: NotificationItem[] = [];

    orders
      .filter(
        (o) =>
          (Date.now() - new Date(o.date).getTime()) / 36e5 < 72
      )
      .slice(0, 5)
      .forEach((o) => {
        list.push({
          id: `n-${o.id}`,
          type: "order",
          title: `سفارش ${o.code} از ${o.customerName} ثبت شد`,
          time: o.date,
        });
      });

    products
      .filter((p) => p.stock > 0 && p.stock < 10)
      .slice(0, 4)
      .forEach((p) => {
        list.push({
          id: `s-${p.id}`,
          type: "stock",
          title: `موجودی «${p.name}» رو به اتمام است`,
          time: new Date().toISOString(),
        });
      });

    return list
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 8);
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
