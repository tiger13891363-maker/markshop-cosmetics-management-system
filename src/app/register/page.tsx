"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ArrowRight,
  QrCode,
} from "lucide-react";

import { useApp } from "@/store/AppStore";
import {
  Button,
  Input,
  ProductImage,
  Textarea,
} from "@/components/ui";

import type { Order } from "@/lib/types";
import { faDate, faMoney } from "@/lib/format";

export default function Register() {
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

  const {
    loading,
    products,
    registerOrder,
    toast,
    settings,
  } = useApp();

  const productIdFromUrl = searchParams.get("product");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [qty, setQty] = useState(
    Math.max(1, Number(searchParams.get("qty") || 1))
  );

  const [errs, setErrs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Order | null>(null);

  const product = useMemo(() => {
    if (!productIdFromUrl) return undefined;

    return products.find(
      (p) =>
        p.id === productIdFromUrl &&
        p.status === "active" &&
        p.stock > 0
    );
  }, [products, productIdFromUrl]);

  const maxQty = product
    ? Math.min(product.stock, 99)
    : 99;

  const safeQty = Math.min(Math.max(1, qty), maxQty);

  const total = product
    ? product.price * safeQty
    : 0;

  const validate = () => {
    const e: Record<string, string> = {};

    if (form.name.trim().length < 3) {
      e.name = "نام و نام خانوادگی را کامل وارد کنید";
    }

    if (!/^09\d{9}$/.test(form.phone.trim())) {
      e.phone = "شماره موبایل معتبر نیست";
    }

    if (!product) {
      e.product = "محصول موردنظر پیدا نشد";
    }

    setErrs(e);

    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate() || !product) return;

    setSubmitting(true);

    try {
      const order = await registerOrder({
        name: form.name.trim(),
        phone: form.phone.trim(),
        items: [
          {
            productId: product.id,
            name: product.name,
            qty: safeQty,
            price: product.price,
          },
        ],
        address: form.address.trim(),
        notes: form.notes.trim(),
      });

      setDone(order);

      toast(
        "success",
        "سفارش با موفقیت ثبت شد",
        `کد پیگیری شما: ${order.code}`
      );
    } catch {
      toast(
        "error",
        "خطا در ثبت سفارش",
        "لطفاً دوباره تلاش کنید"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="h-64 rounded-3xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <main className="min-h-screen bg-slate-50 pb-12">

        <header
          style={{ background: "var(--hero-grad)" }}
          className="px-4 py-10"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-2xl font-black text-white">
              {settings.shopName}
            </h1>

            <p className="mt-2 text-sm text-white/70">
              سفارش آنلاین
            </p>
          </div>
        </header>

        <section className="mx-auto -mt-4 max-w-xl px-4">

          <div className="rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500">
              <CheckCircle2 className="h-11 w-11 text-white" />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-800">
              سفارش شما ثبت شد!
            </h2>

            <p className="mt-3 text-sm text-slate-500">
              کد پیگیری سفارش شما:
            </p>

            <div
              dir="ltr"
              className="mx-auto mt-3 inline-block rounded-xl bg-brand-50 px-5 py-3 text-xl font-black text-brand-700"
            >
              {done.code}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-right">

              <div className="flex items-center justify-between border-b border-slate-200 py-3">
                <span className="text-slate-500">
                  محصول
                </span>

                <span className="font-bold text-slate-700">
                  {done.items[0]?.name}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 py-3">
                <span className="text-slate-500">
                  تعداد
                </span>

                <span className="font-bold text-slate-700">
                  {done.items[0]?.qty}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 py-3">
                <span className="text-slate-500">
                  تاریخ
                </span>

                <span className="font-bold text-slate-700">
                  {faDate(done.date)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="font-bold text-slate-600">
                  مبلغ کل
                </span>

                <span className="font-black text-brand-700">
                  {faMoney(done.total)}
                </span>
              </div>

            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Truck className="h-4 w-4 text-azure-600" />

              سفارش شما برای بررسی به مارک‌شاپ ارسال شد
            </div>

            <Link
              href="/my-orders"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white"
            >
              <QrCode className="h-4 w-4" />
              پیگیری سفارش‌های من
            </Link>

            <div className="mt-4">

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-600"
              >
                <ShoppingBag className="h-4 w-4" />
                بازگشت به فروشگاه
              </Link>

            </div>

          </div>

        </section>

      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">

        <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center shadow-lg">

          <ShoppingBag className="mx-auto h-14 w-14 text-slate-300" />

          <h1 className="mt-5 text-xl font-black text-slate-700">
            محصولی انتخاب نشده است
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            لطفاً ابتدا محصول موردنظر خود را از فروشگاه انتخاب کنید.
          </p>

          <Link href="/shop">

            <Button className="mt-6">
              رفتن به فروشگاه
            </Button>

          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12">

      <header
        style={{ background: "var(--hero-grad)" }}
        className="px-4 py-10"
      >

        <div className="mx-auto max-w-4xl">

          <Link
            href="/shop"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white"
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت به فروشگاه
          </Link>

          <h1 className="text-3xl font-black text-white">
            بررسی و ثبت سفارش
          </h1>

          <p className="mt-2 text-sm text-white/70">
            اطلاعات خود را وارد کنید و سفارش را نهایی نمایید
          </p>

        </div>

      </header>

      <section className="mx-auto -mt-5 grid max-w-4xl gap-5 px-4 lg:grid-cols-2">

        {/* محصول انتخاب شده */}

        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">

          <h2 className="text-lg font-black text-slate-800">
            محصول انتخاب‌شده
          </h2>

          <div className="mt-5 flex gap-4">

            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
              <ProductImage
                src={product.image}
                alt={product.name}
              />
            </div>

            <div className="flex-1">

              <h3 className="font-black text-slate-700">
                {product.name}
              </h3>

              <p className="mt-2 font-bold text-brand-600">
                {faMoney(product.price)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                موجودی: {product.stock}
              </p>

            </div>

          </div>

          {/* تعداد */}

          <div className="mt-6">

            <p className="mb-3 text-sm font-bold text-slate-600">
              تعداد
            </p>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2">

              <button
                type="button"
                onClick={() =>
                  setQty(Math.max(1, safeQty - 1))
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm"
              >
                <Minus className="h-4 w-4" />
              </button>

              <span className="text-lg font-black text-slate-700">
                {safeQty}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQty(Math.min(maxQty, safeQty + 1))
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm"
              >
                <Plus className="h-4 w-4" />
              </button>

            </div>

          </div>

          {/* مبلغ */}

          <div className="mt-6 rounded-2xl bg-gold-100/70 p-4">

            <div className="flex items-center justify-between">

              <span className="font-bold text-slate-600">
                مبلغ کل
              </span>

              <span className="text-xl font-black text-indigo-950">
                {faMoney(total)}
              </span>

            </div>

          </div>

        </div>

        {/* اطلاعات مشتری */}

        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">

          <h2 className="text-lg font-black text-slate-800">
            اطلاعات شما
          </h2>

          <div className="mt-5 space-y-4">

            <div>

              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="نام و نام خانوادگی"
              />

              {errs.name && (
                <p className="mt-1 text-xs text-rose-500">
                  {errs.name}
                </p>
              )}

            </div>

            <div>

              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                placeholder="شماره موبایل"
                dir="ltr"
              />

              {errs.phone && (
                <p className="mt-1 text-xs text-rose-500">
                  {errs.phone}
                </p>
              )}

            </div>

            <Textarea
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
              placeholder="آدرس (اختیاری)"
            />

            <Textarea
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
              placeholder="توضیحات سفارش (اختیاری)"
            />

            {errs.product && (
              <p className="text-xs text-rose-500">
                {errs.product}
              </p>
            )}

            <Button
              onClick={submit}
              disabled={submitting}
              className="w-full gap-2 py-3"
            >

              <ShoppingBag className="h-5 w-5" />

              {submitting
                ? "در حال ثبت سفارش..."
                : "ثبت نهایی سفارش"}

            </Button>

          </div>

        </div>

      </section>

    </main>
  );
}
