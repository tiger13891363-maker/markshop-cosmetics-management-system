"use client";

import Link from "next/link";
import {
  ClipboardList,
  ChevronLeft,
  Package,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { useApp } from "@/store/AppStore";
import {
  Avatar,
  Card,
  PageSkeleton,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { BarChart, DonutChart, HBars } from "@/components/charts";
import {
  ORDER_STATUS,
  STATUS_ORDER,
  salesHistory,
  totalOrdersAll,
} from "@/lib/mock-data";
import type { OrderStatus } from "@/lib/types";
import {
  faDateShort,
  faMoneyCompact,
  faNum,
  timeAgo,
} from "@/lib/format";

const DONUT_COLORS: Record<OrderStatus, string> = {
  new: "#3B82F6",
  processing: "#8B5CF6",
  ready: "#6C2BD9",
  shipped: "#06B6D4",
  completed: "#10B981",
  cancelled: "#F43F5E",
};

function Dashboard() {
  const {
    loading,
    products,
    customers,
    orders,
    notifications,
    markAllRead,
    unread,
  } = useApp();

  const active = orders.filter((o) => o.status !== "cancelled");
  const newOrders = orders.filter((o) => o.status === "new").length;
  const outCount = products.filter((p) => p.stock === 0).length;
  const todaySales = active
    .filter(
      (o) => new Date(o.date).toDateString() === new Date().toDateString()
    )
    .reduce((s, o) => s + o.total, 0);
  const monthSales = active
    .filter(
      (o) => Date.now() - new Date(o.date).getTime() < 30 * 864e5
    )
    .reduce((s, o) => s + o.total, 0);

  const last14 = salesHistory.slice(-14).map((v, i) => ({
    label: faDateShort(
      new Date(Date.now() - (13 - i) * 864e5).toISOString()
    ),
    value: v,
  }));

  const donutItems = STATUS_ORDER.map((s) => ({
    label: ORDER_STATUS[s].label,
    value: orders.filter((o) => o.status === s).length,
    color: DONUT_COLORS[s],
  }));

  const rev: Record<string, number> = {};
  active.forEach((o) =>
    o.items.forEach((i) => {
      rev[i.name] = (rev[i.name] ?? 0) + i.qty * i.price;
    })
  );
  const topProducts = Object.entries(rev)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  const spend: Record<string, number> = {};
  active.forEach((o) => {
    spend[o.customerName] = (spend[o.customerName] ?? 0) + o.total;
  });
  const latestCustomers = [...customers]
    .sort((a, b) => b.registrationDate.localeCompare(a.registrationDate))
    .slice(0, 5);

  const latestOrders = [...orders]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  if (loading)
    return (
      <Shell title="داشبورد" subtitle="نمای کلی فروشگاه">
        <PageSkeleton />
      </Shell>
    );

  return (
    <Shell title="داشبورد" subtitle="نمای کلی فروشگاه مارک‌شاپ">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-6">
        <StatCard icon={Package} label="تعداد کل سفارش‌ها" value={faNum(totalOrdersAll)} sub="+۸٪ نسبت به ماه قبل" tone="brand" />
        <StatCard icon={ClipboardList} label="سفارش‌های جدید" value={faNum(newOrders)} sub="در انتظار بررسی" tone="azure" up={false} />
        <StatCard icon={ShoppingBag} label="تعداد محصولات" value={faNum(products.length)} sub={`${faNum(outCount)} بدون موجودی`} tone="violet" up={outCount === 0} />
        <StatCard icon={Users} label="تعداد مشتریان" value={faNum(customers.length)} sub="+۳ مشتری این هفته" tone="emerald" />
        <StatCard icon={Wallet} label="فروش امروز" value={faMoneyCompact(todaySales)} sub="از شروع روز" tone="gold" up={todaySales > 0} />
        <StatCard icon={TrendingUp} label="فروش این ماه" value={faMoneyCompact(monthSales)} sub="+۱۲٪ نسبت به ماه قبل" tone="azure" />
      </div>

      {/* Charts row */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card
          title="نمودار فروش"
          subtitle="۱۴ روز اخیر"
          className="lg:col-span-2"
          action={
            <Link
              href="/reports"
              className="flex items-center gap-1 text-xs font-bold text-azure-600 transition hover:text-azure-800"
            >
              گزارش کامل
              <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <BarChart data={last14} />
        </Card>
        <Card title="وضعیت سفارش‌ها" subtitle="سفارش‌های ثبت شده اخیر">
          <DonutChart
            items={donutItems}
            centerTitle="سفارش"
            centerValue={faNum(orders.length)}
          />
        </Card>
      </div>

      {/* Orders + notifications */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card
          title="جدول آخرین سفارش‌ها"
          className="lg:col-span-2"
          bodyClass="overflow-x-auto"
          action={
            <Link
              href="/orders"
              className="flex items-center gap-1 text-xs font-bold text-azure-600 transition hover:text-azure-800"
            >
              مشاهده همه
              <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-right text-[11px] text-slate-400">
                <th className="px-5 py-3 font-semibold">شماره سفارش</th>
                <th className="px-3 py-3 font-semibold">مشتری</th>
                <th className="px-3 py-3 font-semibold">مبلغ</th>
                <th className="px-3 py-3 font-semibold">وضعیت</th>
                <th className="px-5 py-3 font-semibold">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => (window.location.href = `/orders?q=${encodeURIComponent(o.code)}`)}
                  className="cursor-pointer border-b border-slate-50 transition last:border-0 hover:bg-brand-50/40"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-brand-600" dir="ltr">
                      {o.code}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 font-medium text-slate-700">
                    {o.customerName}
                  </td>
                  <td className="px-3 py-3.5 font-semibold text-slate-700">
                    {faMoneyCompact(o.total)}
                  </td>
                  <td className="px-3 py-3.5">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">
                    {timeAgo(o.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card
          title="بخش اعلان‌ها"
          action={
            unread > 0 ? (
              <button
                onClick={markAllRead}
                className="text-[11px] font-bold text-azure-600 transition hover:text-azure-800"
              >
                خواندنه شد
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-500">
                به‌روز
              </span>
            )
          }
          bodyClass="p-2"
        >
          <ul>
            {notifications.length === 0 ? (
              <li className="px-3 py-10 text-center text-xs text-slate-400">
                اعلانی موجود نیست
              </li>
            ) : (
              notifications.slice(0, 6).map((n) => (
                <li
                  key={n.id}
                  className="flex gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${
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
                    <span className="text-[10px] text-slate-400">
                      {timeAgo(n.time)}
                    </span>
                  </span>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      {/* Customers + top products */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card
          title="آخرین مشتریان"
          subtitle="جدیدترین ثبت‌نام‌ها"
          action={
            <Link
              href="/customers"
              className="flex items-center gap-1 text-xs font-bold text-azure-600 transition hover:text-azure-800"
            >
              همه
              <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
          }
          bodyClass="p-2"
        >
          <ul>
            {latestCustomers.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
              >
                <Avatar name={c.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-slate-700">
                    {c.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    عضویت: {timeAgo(c.registrationDate)}
                  </span>
                </span>
                <span className="shrink-0 rounded-lg bg-gold-100 px-2 py-1 text-[10px] font-bold text-gold-600">
                  {faMoneyCompact(spend[c.name] ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="محصولات پرفروش"
          subtitle="بر اساس فروش سفارش‌های اخیر"
          className="lg:col-span-2"
        >
          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">
              هنوز فروشی ثبت نشده است
            </p>
          ) : (
            <HBars
              gold
              items={topProducts}
              format={(v) => faMoneyCompact(v)}
            />
          )}
        </Card>
      </div>
    </Shell>
  );
}

export default function Page() {
  return <Dashboard />;
}
