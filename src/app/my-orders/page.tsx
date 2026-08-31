"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Package,
  Search,
  ShoppingBag,
} from "lucide-react";
import { useApp } from "@/store/AppStore";
import { Button, Input, StatusBadge } from "@/components/ui";
import { faMoney, faDate } from "@/lib/format";

export default function MyOrdersPage() {
  const { orders, loading } = useApp();
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);

  const myOrders = searched
    ? orders.filter((o) => o.customerPhone === phone.trim())
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl animate-pulse">
          <div className="h-32 rounded-3xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <header
        style={{ background: "var(--hero-grad)" }}
        className="px-4 py-10"
      >
        <div className="mx-auto max-w-3xl">
          <Link
            href="/shop"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white"
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت به فروشگاه
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
              <ClipboardList className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-black text-white">
                پیگیری سفارش‌های من
              </h1>
              <p className="mt-1 text-sm text-white/70">
                شماره موبایل خود را وارد کنید تا سفارش‌هایتان را ببینید
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto -mt-5 max-w-3xl px-4">
        <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 09121234567"
                dir="ltr"
              />
            </div>

            <Button
              onClick={() => setSearched(true)}
              disabled={phone.trim().length < 11}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              مشاهده سفارش‌ها
            </Button>
          </div>
        </div>

        {!searched && (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 font-bold text-slate-600">
              برای مشاهده سفارش‌ها شماره موبایل خود را وارد کنید
            </p>
          </div>
        )}

        {searched && myOrders.length === 0 && (
          <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-black text-slate-700">
              سفارشی پیدا نشد
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              هنوز سفارشی با این شماره موبایل ثبت نشده است
            </p>

            <Link href="/shop">
              <Button className="mt-5">
                مشاهده محصولات
              </Button>
            </Link>
          </div>
        )}

        {myOrders.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-black text-slate-700">
              سفارش‌های شما ({myOrders.length})
            </h2>

            {myOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      کد پیگیری سفارش
                    </p>
                    <p
                      dir="ltr"
                      className="mt-1 text-lg font-black text-brand-600"
                    >
                      {order.code}
                    </p>
                  </div>

                  <StatusBadge status={order.status} />
                </div>

                <div className="mt-4 space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="font-bold text-slate-700">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          تعداد: {item.qty}
                        </p>
                      </div>

                      <p className="font-bold text-slate-600">
                        {faMoney(item.qty * item.price)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gold-100/60 px-4 py-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      تاریخ ثبت
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {faDate(order.date)}
                    </p>
                  </div>

                  <div className="text-left">
                    <p className="text-xs text-slate-500">
                      مبلغ کل
                    </p>
                    <p className="mt-1 font-black text-indigo-950">
                      {faMoney(order.total)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-600 shadow-sm ring-1 ring-slate-200"
          >
            <ShoppingBag className="h-4 w-4" />
            رفتن به فروشگاه و ثبت سفارش جدید
          </Link>
        </div>
      </section>
    </main>
  );
}
