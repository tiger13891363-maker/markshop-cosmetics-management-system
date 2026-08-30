"use client";

import { useMemo, useState } from "react";
import { Crown, Package, TrendingUp, Users, Wallet } from "lucide-react";
import { Shell } from "@/components/Shell";
import { useApp } from "@/store/AppStore";
import { Avatar, Card, PageSkeleton, StatCard } from "@/components/ui";
import { AreaChart, BarChart, DonutChart, HBars } from "@/components/charts";
import {
  ORDER_STATUS,
  STATUS_ORDER,
  customerGrowth,
  monthlyOrders,
  salesHistory,
  totalOrdersAll,
} from "@/lib/mock-data";
import type { OrderStatus } from "@/lib/types";
import {
  faDateShort,
  faMoney,
  faMoneyCompact,
  faNum,
  monthLabel,
} from "@/lib/format";

const DONUT_COLORS: Record<OrderStatus, string> = {
  new: "#3B82F6",
  processing: "#8B5CF6",
  ready: "#6C2BD9",
  shipped: "#06B6D4",
  completed: "#10B981",
  cancelled: "#F43F5E",
};

const CAT_COLORS: Record<string, string> = {
  "آرایشی": "#8B5CF6",
  "مراقبت پوست": "#6C2BD9",
  "عطر و خوشبو": "#D4AF37",
  "مراقبت مو": "#2563EB",
  "بهداشت شخصی": "#06B6D4",
};

type Period = "day" | "week" | "month";

function Reports() {
  const { loading, orders, products, customers } = useApp();
  const [period, setPeriod] = useState<Period>("day");

  const totalRevenue = useMemo(
    () => salesHistory.reduce((a, b) => a + b, 0),
    []
  );

  const chart = useMemo(() => {
    if (period === "day") {
      return salesHistory.slice(-14).map((v, i) => ({
        label: faDateShort(new Date(Date.now() - (13 - i) * 864e5).toISOString()),
        value: v,
      }));
    }
    if (period === "week") {
      return Array.from({ length: 12 }, (_, i) => {
        const start = -84 + i * 7;
        const sum = salesHistory.slice(start, start + 7).reduce((a, b) => a + b, 0);
        return {
          label: faDateShort(new Date(Date.now() + start * 864e5).toISOString()),
          value: sum,
        };
      });
    }
    return Array.from({ length: 6 }, (_, i) => {
      const start = -180 + i * 30;
      const sum = salesHistory.slice(start, start + 30).reduce((a, b) => a + b, 0);
      return { label: monthLabel(5 - i), value: sum };
    });
  }, [period]);

  const catRevenue = useMemo(() => {
    const m: Record<string, number> = {};
    orders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) =>
        o.items.forEach((i) => {
          const cat =
            products.find((p) => p.id === i.productId)?.category ?? "سایر";
          m[cat] = (m[cat] ?? 0) + i.qty * i.price;
        })
      );
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({
        label,
        value,
        color: CAT_COLORS[label] ?? "#94A3B8",
      }));
  }, [orders, products]);

  const statusItems = STATUS_ORDER.map((s) => ({
    label: ORDER_STATUS[s].label,
    value: orders.filter((o) => o.status === s).length,
    color: DONUT_COLORS[s],
  }));

  const topProducts = useMemo(() => {
    const rev: Record<string, number> = {};
    const qty: Record<string, number> = {};
    orders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) =>
        o.items.forEach((i) => {
          rev[i.name] = (rev[i.name] ?? 0) + i.qty * i.price;
          qty[i.name] = (qty[i.name] ?? 0) + i.qty;
        })
      );
    return Object.entries(rev)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({
        label,
        value,
        sub: `${faNum(qty[label])} فروش`,
      }));
  }, [orders]);

  const topCustomers = useMemo(() => {
    const m: Record<string, { name: string; count: number; total: number }> = {};
    orders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) => {
        const c = (m[o.customerId] ??= {
          name: o.customerName,
          count: 0,
          total: 0,
        });
        c.count++;
        c.total += o.total;
      });
    return Object.entries(m)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [orders]);

  if (loading)
    return (
      <Shell title="گزارش‌ها" subtitle="تحلیل عملکرد فروشگاه">
        <PageSkeleton />
      </Shell>
    );

  return (
    <Shell title="گزارش‌ها" subtitle="تحلیل عملکرد فروشگاه مارک‌شاپ">
      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <StatCard icon={Wallet} label="درآمد کل (۶ ماه اخیر)" value={faMoneyCompact(totalRevenue)} sub="+۱۵٪ رشد" tone="gold" />
        <StatCard icon={Package} label="تعداد کل سفارش‌ها" value={faNum(totalOrdersAll)} sub={`${faNum(monthlyOrders[monthlyOrders.length - 1])} سفارش این ماه`} tone="brand" />
        <StatCard icon={TrendingUp} label="میانگین ارزش سفارش" value={faMoneyCompact(totalRevenue / totalOrdersAll)} sub="+۴٪ رشد" tone="azure" />
        <StatCard icon={Users} label="مشتریان فعلی" value={faNum(customerGrowth[customerGrowth.length - 1])} sub={`${faNum(customers.length)} مشتری فعال سیستم`} tone="emerald" />
      </div>

      {/* Sales over time */}
      <Card
        className="mt-5"
        title="فروش در طول زمان"
        subtitle={
          period === "day"
            ? "نمایش روزانه — ۱۴ روز اخیر"
            : period === "week"
              ? "نمایش هفتگی — ۱۲ هفته اخیر"
              : "نمایش ماهانه — ۶ ماه اخیر"
        }
        action={
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            {(
              [
                ["day", "روزانه"],
                ["week", "هفتگی"],
                ["month", "ماهانه"],
              ] as [Period, string][]
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setPeriod(k)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                  period === k
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      >
        <BarChart data={chart} />
      </Card>

      {/* Donuts + growth */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="فروش محصولات" subtitle="بر اساس دسته‌بندی">
          <DonutChart
            items={catRevenue}
            centerTitle="دسته"
            centerValue={faNum(catRevenue.length)}
          />
        </Card>
        <Card title="وضعیت سفارش‌ها" subtitle="سفارش‌های ثبت شده">
          <DonutChart
            items={statusItems}
            centerTitle="سفارش"
            centerValue={faNum(orders.length)}
          />
        </Card>
        <Card title="رشد مشتریان" subtitle="مشتریان تجمعی ۶ ماه اخیر">
          <AreaChart
            data={customerGrowth}
            labels={customerGrowth.map((_, i) => monthLabel(5 - i))}
          />
        </Card>
      </div>

      {/* Top lists */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card
          title="محصولات پرفروش"
          subtitle="بر اساس ارزش فروش"
          className="lg:col-span-2"
        >
          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">
              داده‌ای برای نمایش وجود ندارد
            </p>
          ) : (
            <HBars gold items={topProducts} format={(v) => faMoneyCompact(v)} />
          )}
        </Card>

        <Card title="مشتریان برتر" subtitle="بیشترین میزان خرید" bodyClass="p-2">
          <ul>
            {topCustomers.map((c, i) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                    i === 0
                      ? "bg-gold-400 text-indigo-950"
                      : i === 1
                        ? "bg-slate-300 text-slate-700"
                        : i === 2
                          ? "bg-amber-600/80 text-white"
                          : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {i === 0 ? <Crown className="h-3.5 w-3.5" /> : faNum(i + 1)}
                </span>
                <Avatar name={c.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-slate-700">
                    {c.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {faNum(c.count)} سفارش
                  </span>
                </span>
                <span className="shrink-0 text-xs font-black text-brand-700">
                  {faMoney(c.total)}
                </span>
              </li>
            ))}
            {topCustomers.length === 0 && (
              <li className="px-3 py-10 text-center text-xs text-slate-400">
                داده‌ای موجود نیست
              </li>
            )}
          </ul>
        </Card>
      </div>
    </Shell>
  );
}

export default function ReportsPage() {
  return <Reports />;
}
