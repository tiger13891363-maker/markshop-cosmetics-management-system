"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ArrowRight,
  QrCode,
  Trash2,
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

type CartItem = {
  productId: string;
  qty: number;
};

export default function Register() {
  const {
    loading,
    products,
    registerOrder,
    toast,
    settings,
  } = useApp();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [errs, setErrs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("markshop-cart");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch {
      setCart([]);
    } finally {
      setCartLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;

    localStorage.setItem(
      "markshop-cart",
      JSON.stringify(cart)
    );
  }, [cart, cartLoaded]);

  const cartItems = useMemo(() => {
    return cart
      .map((item) => {
        const product = products.find(
          (p) =>
            p.id === item.productId &&
            p.status === "active" &&
            p.stock > 0
        );

        if (!product) return null;

        const qty = Math.min(
          Math.max(1, item.qty),
          Math.min(product.stock, 99)
        );

        return {
          product,
          qty,
        };
      })
      .filter(Boolean) as {
        product: (typeof products)[number];
        qty: number;
      }[];
  }, [cart, products]);

  const total = cartItems.reduce(
    (sum, item) =>
      sum + item.product.price * item.qty,
    0
  );

  const updateQty = (
    productId: string,
    nextQty: number
  ) => {
    const product = products.find(
      (p) => p.id === productId
    );

    if (!product) return;

    const safeQty = Math.min(
      Math.max(1, nextQty),
      Math.min(product.stock, 99)
    );

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, qty: safeQty }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => item.productId !== productId
      )
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (form.name.trim().length < 3) {
      e.name =
        "نام و نام خانوادگی را کامل وارد کنید";
    }

    if (!/^09\d{9}$/.test(form.phone.trim())) {
      e.phone =
        "شماره موبایل معتبر نیست";
    }

    if (cartItems.length === 0) {
      e.cart =
        "سبد خرید شما خالی است";
    }

    setErrs(e);

    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    setSubmitting(true);

    try {
      const order = await registerOrder({
        name: form.name.trim(),
        phone: form.phone.trim(),

        items: cartItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          qty: item.qty,
          price: item.product.price,
        })),

        address: form.address.trim(),
        notes: form.notes.trim(),
      });

      setDone(order);

      localStorage.removeItem("markshop-cart");
      setCart([]);

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

  if (loading || !cartLoaded) {
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

              <div className="space-y-3">

                {done.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-slate-200 pb-3"
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

  return (
    <main className="min-h-screen bg-slate-50 pb-12">

      <header
        style={{ background: "var(--hero-grad)" }}
        className="px-4 py-8"
      >
        <div className="mx-auto max-w-4xl">

          <Link
            href="/shop"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-white/80"
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت به فروشگاه
          </Link>

          <h1 className="text-2xl font-black text-white">
            بررسی و ثبت سفارش
          </h1>

          <p className="mt-2 text-sm text-white/70">
            سفارش خود را بررسی کنید و اطلاعاتتان را وارد کنید
          </p>

        </div>
      </header>

      <section className="mx-auto -mt-4 max-w-4xl px-4">

        <div className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">

            <h2 className="text-xl font-black text-slate-800">
              سبد خرید شما
            </h2>

            {errs.cart && (
              <p className="mt-3 text-sm font-bold text-red-500">
                {errs.cart}
              </p>
            )}

            {cartItems.length === 0 ? (

              <div className="py-12 text-center">

                <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />

                <h3 className="mt-4 font-black text-slate-700">
                  سبد خرید شما خالی است
                </h3>

                <Link href="/shop">
                  <Button className="mt-5">
                    رفتن به فروشگاه
                  </Button>
                </Link>

              </div>

            ) : (

              <div className="mt-5 space-y-4">

                {cartItems.map(({ product, qty }) => (

                  <div
                    key={product.id}
                    className="rounded-2xl border border-slate-100 p-4"
                  >

                    <div className="flex gap-3">

                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        <ProductImage
                          src={product.image || ""}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">

                        <h3 className="truncate font-black text-slate-700">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-sm font-bold text-brand-600">
                          {faMoney(product.price)}
                        </p>

                        <div className="mt-3 flex items-center justify-between">

                          <div className="flex items-center gap-2">

                            <button
                              onClick={() =>
                                updateQty(
                                  product.id,
                                  qty - 1
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span className="w-6 text-center font-black">
                              {qty}
                            </span>

                            <button
                              onClick={() =>
                                updateQty(
                                  product.id,
                                  qty + 1
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white"
                            >
                              <Plus className="h-4 w-4" />
                            </button>

                          </div>

                          <button
                            onClick={() =>
                              removeItem(product.id)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>

                      </div>

                    </div>

                  </div>

                ))}

                <div className="flex items-center justify-between rounded-2xl bg-brand-50 p-4">

                  <span className="font-bold text-slate-600">
                    مبلغ کل
                  </span>

                  <span className="text-lg font-black text-brand-700">
                    {faMoney(total)}
                  </span>

                </div>

              </div>

            )}

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">

            <h2 className="text-xl font-black text-slate-800">
              اطلاعات مشتری
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
                  <p className="mt-1 text-xs text-red-500">
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
                  <p className="mt-1 text-xs text-red-500">
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
                placeholder="آدرس کامل (اختیاری)"
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

              <Button
                onClick={submit}
                disabled={
                  submitting ||
                  cartItems.length === 0
                }
                className="w-full gap-2"
              >
                {submitting ? (
                  "در حال ثبت سفارش..."
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    ثبت نهایی سفارش
                  </>
                )}
              </Button>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
