"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardPlus,
  LayoutDashboard,
  Menu,
  Package,
  QrCode,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/store/AppStore";
import { Avatar } from "@/components/ui";
import { faDate, faNum, timeAgo } from "@/lib/format";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  section: string;
}

const NAV: NavItem[] = [
  { href: "/", label: "داشبورد", icon: LayoutDashboard, section: "اصلی" },
  { href: "/orders", label: "مدیریت سفارش‌ها", icon: Package, section: "اصلی" },
  { href: "/products", label: "مدیریت محصولات", icon: ShoppingBag, section: "اصلی" },
  { href: "/customers", label: "مدیریت مشتریان", icon: Users, section: "اصلی" },
  { href: "/reports", label: "گزارش‌ها", icon: BarChart3, section: "اصلی" },
  { href: "/register", label: "ثبت سفارش", icon: ClipboardPlus, section: "ابزارها" },
  { href: "/qr", label: "کد QR", icon: QrCode, section: "ابزارها" },
  { href: "/settings", label: "تنظیمات", icon: Settings, section: "ابزارها" },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  const { settings } = useApp();
  return (
    <div className="flex items-center gap-3">
      {settings.logo ? (
        <img
          src={settings.logo}
          alt="لوگو"
          className="h-11 w-11 rounded-xl object-cover ring-2 ring-white/20"
        />
      ) : (
        <span
          className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl font-black text-white ring-1 ring-white/20"
          style={{ backgroundImage: "none" }}
        >
          M
          <span className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-gold-400" />
        </span>
      )}
      {!compact && (
        <span className="leading-tight">
          <span className="block text-base font-black text-white">
            {settings.shopName}
          </span>
          <span className="block text-[10px] font-semibold tracking-[0.18em] text-gold-300">
            MARKSHOP
          </span>
        </span>
      )}
    </div>
  );
}

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { orders, settings } = useApp();
  const newCount = orders.filter((o) => o.status === "new").length;
  let lastSection = "";

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--side-grad)" }}>
      {/* top: date chip */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2.5 text-[11px] font-medium text-indigo-100 ring-1 ring-white/10">
          <CalendarDays className="h-3.5 w-3.5 text-gold-300" />
          {faDate(new Date().toISOString())}
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const heading =
            item.section !== lastSection ? (
              <p key={item.section} className="mx-2 mb-2 mt-4 text-[10px] font-bold tracking-wide text-indigo-200/60 first:mt-1">
                {item.section}
              </p>
            ) : null;
          lastSection = item.section;
          return (
            <React.Fragment key={item.href}>
              {heading}
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`group relative mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                  active
                    ? "bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "text-indigo-100/75 hover:bg-white/8 hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute -right-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-l-full bg-gold-400" />
                )}
                <item.icon className={`h-[18px] w-[18px] ${active ? "text-gold-300" : "text-indigo-200/70 group-hover:text-white"}`} />
                <span className="flex-1">{item.label}</span>
                {item.href === "/orders" && newCount > 0 && (
                  <span className="rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-extrabold text-indigo-950">
                    {faNum(newCount)}
                  </span>
                )}
              </Link>
            </React.Fragment>
          );
        })}
      </nav>

      {/* bottom: brand + admin */}
      <div className="border-t border-white/10 p-4">
        <BrandMark />
        <Link
          href="/settings"
          onClick={onNavigate}
          className="mt-4 flex items-center gap-3 rounded-xl bg-white/8 p-3 ring-1 ring-white/10 transition hover:bg-white/12"
        >
          <Avatar name={settings.adminName} size="sm" />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-xs font-bold text-white">
              {settings.adminName}
            </span>
            <span className="block text-[10px] text-indigo-200/70">
              مدیر فروشگاه
            </span>
          </span>
          <Settings className="h-4 w-4 text-indigo-200/60" />
        </Link>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const { products, customers, orders } = useApp();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node))
        setOpen(false);
    };
    window.addEventListener("mousedown", fn);
    return () => window.removeEventListener("mousedown", fn);
  }, []);

  const res = useMemo(() => {
    const s = q.trim();
    if (s.length < 2) return null;
    return {
      products: products
        .filter((p) => p.name.includes(s))
        .slice(0, 4),
      customers: customers
        .filter((c) => c.name.includes(s) || c.phone.includes(s))
        .slice(0, 3),
      orders: orders
        .filter(
          (o) => o.code.includes(s) || o.customerName.includes(s)
        )
        .slice(0, 3),
    };
  }, [q, products, customers, orders]);

  const go = (url: string) => {
    setQ("");
    setOpen(false);
    router.push(url);
  };

  const count = res
    ? res.products.length + res.customers.length + res.orders.length
    : 0;

  return (
    <div ref={boxRef} className="relative hidden w-80 lg:block">
      <Search className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="جستجوی سفارش، مشتری یا محصول…"
        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pr-10 pl-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-azure-500 focus:bg-white focus:ring-2 focus:ring-azure-500/15"
      />
      {open && res && (
        <div className="absolute top-[calc(100%+6px)] right-0 left-0 z-50 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 animate-pop">
          {count === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-slate-400">
              نتیجه‌ای یافت نشد
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto p-2">
              {res.products.length > 0 && (
                <>
                  <p className="px-2 pt-1 pb-1 text-[10px] font-bold text-slate-400">محصولات</p>
                  {res.products.map((p) => (
                    <button
                      key={p.id}
                      onMouseDown={() => go(`/products?q=${encodeURIComponent(p.name)}`)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-right text-xs font-medium text-slate-600 transition hover:bg-brand-50"
                    >
                      <ShoppingBag className="h-3.5 w-3.5 text-brand-500" />
                      {p.name}
                    </button>
                  ))}
                </>
              )}
              {res.customers.length > 0 && (
                <>
                  <p className="px-2 pt-1 pb-1 text-[10px] font-bold text-slate-400">مشتریان</p>
                  {res.customers.map((c) => (
                    <button
                      key={c.id}
                      onMouseDown={() => go(`/customers?q=${encodeURIComponent(c.name)}`)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-right text-xs font-medium text-slate-600 transition hover:bg-brand-50"
                    >
                      <Users className="h-3.5 w-3.5 text-azure-600" />
                      {c.name}
                      <span className="mr-auto text-[10px] text-slate-400" dir="ltr">
                        {c.phone}
                      </span>
                    </button>
                  ))}
                </>
              )}
              {res.orders.length > 0 && (
                <>
                  <p className="px-2 pt-1 pb-1 text-[10px] font-bold text-slate-400">سفارش‌ها</p>
                  {res.orders.map((o) => (
                    <button
                      key={o.id}
                      onMouseDown={() => go(`/orders?q=${encodeURIComponent(o.code)}`)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-right text-xs font-medium text-slate-600 transition hover:bg-brand-50"
                    >
                      <Package className="h-3.5 w-3.5 text-gold-500" />
                      {o.code} — {o.customerName}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Notifications() {
  const { notifications, unread, markAllRead } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    window.addEventListener("mousedown", fn);
    return () => window.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="اعلان‌ها"
        className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -left-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {faNum(unread > 9 ? 9 : unread)}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-[320px] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 animate-pop">
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h4 className="text-xs font-bold text-slate-700">اعلان‌ها</h4>
            <button
              onClick={markAllRead}
              className="text-[11px] font-semibold text-azure-600 transition hover:text-azure-800"
            >
              علامت‌گذاری همه
            </button>
          </header>
          <ul className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-xs text-slate-400">
                اعلانی موجود نیست
              </li>
            ) : (
              notifications.map((n) => (
                <li key={n.id} className="flex gap-3 border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50/60">
                  <span
                    className={`mt-0.5 rounded-lg p-1.5 ${
                      n.type === "order"
                        ? "bg-azure-50 text-azure-600"
                        : "bg-gold-100 text-gold-600"
                    }`}
                  >
                    {n.type === "order" ? (
                      <Package className="h-3.5 w-3.5" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-slate-700">
                      {n.title}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-slate-400">
                      {timeAgo(n.time)}
                    </span>
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Shell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();
  const { settings } = useApp();

  useEffect(() => setDrawer(false), [pathname]);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar — right side (RTL) */}
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-64 lg:block">
        <SideNav />
      </aside>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${drawer ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-indigo-950/50 backdrop-blur-[2px] transition-opacity duration-300 ${drawer ? "opacity-100" : "opacity-0"}`}
          onClick={() => setDrawer(false)}
        />
        <div
          className={`absolute inset-y-0 right-0 w-72 shadow-2xl transition-transform duration-300 ${drawer ? "translate-x-0" : "translate-x-full"}`}
        >
          <button
            onClick={() => setDrawer(false)}
            aria-label="بستن منو"
            className="absolute top-4 left-4 z-10 rounded-lg bg-white/10 p-1.5 text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <SideNav onNavigate={() => setDrawer(false)} />
        </div>
      </div>

      {/* Content */}
      <div className="lg:pr-64">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 md:px-6 xl:px-8">
            <button
              onClick={() => setDrawer(true)}
              aria-label="باز کردن منو"
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-extrabold text-slate-800 md:text-lg">
                {title}
              </h1>
              {subtitle && (
                <p className="hidden truncate text-[11px] text-slate-400 md:block">
                  {subtitle}
                </p>
              )}
            </div>
            {actions}
            <GlobalSearch />
            <Notifications />
            <div className="hidden items-center gap-2.5 border-r border-slate-200 pr-3 md:flex">
              <Avatar name={settings.adminName} size="sm" />
              <span className="leading-tight">
                <span className="block text-xs font-bold text-slate-700">
                  {settings.adminName}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Store className="h-3 w-3" />
                  مدیر فروشگاه
                </span>
              </span>
            </div>
          </div>
        </header>
        <main className="animate-up mx-auto max-w-[1440px] p-4 md:p-6 xl:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
