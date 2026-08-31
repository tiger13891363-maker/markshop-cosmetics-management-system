"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Store,
  ArrowLeft,
  Package,
} from "lucide-react";

import { useApp } from "@/store/AppStore";
import { faMoney, faNum } from "@/lib/format";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export default function ShopPage() {
  const { loading, products, settings } = useApp();

  const [cart, setCart] = useState<CartItem[]>([]);

  const availableProducts = useMemo(() => {
    return products.filter(
      (product) => product.status === "active" && product.stock > 0
    );
  }, [products]);

  const addToCart = (product: {
    id: string;
    name: string;
    price: number;
  }) => {
    setCart((current) => {
      const exists = current.find((item) => item.id === product.id);

      if (exists) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
        },
      ];
    });
  };

  const increase = (id: string) => {
    setCart((current) =>
      current.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decrease = (id: string) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div
          style={{ background: "var(--hero-grad)" }}
          className="h-52"
        />
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 pb-28"
    >
      {/* Header */}
      <header
        style={{ background: "var(--hero-grad)" }}
        className="sticky top-0 z-40 border-b border-white/10 shadow-lg"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/shop" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
              <Store className="h-6 w-6" />
            </span>

            <div>
              <h1 className="font-black text-white">
                {settings.shopName}
              </h1>
              <p className="text-[10px] font-bold tracking-[0.2em] text-gold-300">
                MARKSHOP STORE
              </p>
            </div>
          </Link>

          <a
            href="#cart"
            className="relative flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-indigo-950 shadow"
          >
            <ShoppingCart className="h-5 w-5" />
            سبد خرید

            {totalItems > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gold-400 px-1 text-xs">
                {faNum(totalItems)}
              </span>
            )}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{ background: "var(--hero-grad)" }}
        className="relative overflow-hidden px-4 pb-14 pt-8"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-gold-300 ring-1 ring-white/20">
              <ShoppingBag className="h-4 w-4" />
              خرید آنلاین از مارک‌شاپ
            </div>

            <h2 className="text-3xl font-black text-white md:text-4xl">
              محصولات مورد علاقه‌ات را انتخاب کن 💄
            </h2>

            <p className="mt-4 text-sm leading-8 text-indigo-100">
              محصولات را ببین، انتخاب کن و سفارش خودت را به‌صورت آنلاین ثبت کن.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800">
              محصولات مارک‌شاپ
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {faNum(availableProducts.length)} محصول موجود است
            </p>
          </div>

          <Package className="h-7 w-7 text-brand-500" />
        </div>

        {availableProducts.length === 0 ? (
          <div className="rounded-3xl bg-white py-16 text-center shadow-sm ring-1 ring-slate-200">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 font-black text-slate-600">
              فعلاً محصولی برای نمایش وجود ندارد
            </h3>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {availableProducts.map((product) => {
              const inCart = cart.find(
                (item) => item.id === product.id
              );

              return (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div
                    style={{ background: "var(--hero-grad)" }}
                    className="flex h-40 items-center justify-center"
                  >
                    <ShoppingBag className="h-16 w-16 text-white/80" />
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-black text-slate-800">
                      {product.name}
                    </h3>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        قیمت
                      </span>

                      <span className="font-black text-brand-600">
                        {faMoney(product.price)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        موجودی
                      </span>

                      <span className="font-bold text-emerald-600">
                        {faNum(product.stock)} عدد
                      </span>
                    </div>

                    {!inCart ? (
                      <button
                        onClick={() => addToCart(product)}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-black text-white transition hover:bg-brand-700 active:scale-95"
                      >
                        <Plus className="h-5 w-5" />
                        افزودن به سبد خرید
                      </button>
                    ) : (
                      <div className="mt-5 flex items-center justify-between rounded-xl bg-brand-50 p-2">
                        <button
                          onClick={() => decrease(product.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm"
                        >
                          <Minus className="h-5 w-5" />
                        </button>

                        <span className="font-black text-brand-700">
                          {faNum(inCart.qty)} عدد در سبد
                        </span>

                        <button
                          onClick={() => increase(product.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cart */}
        <section
          id="cart"
          className="mt-10 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-7"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-100 text-gold-600">
              <ShoppingCart className="h-6 w-6" />
            </span>

            <div>
              <h2 className="font-black text-slate-800">
                سبد خرید شما
              </h2>
              <p className="text-xs text-slate-400">
                محصولات انتخاب‌شده
              </p>
            </div>
          </div>

          {cart.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              هنوز محصولی به سبد خرید اضافه نکرده‌اید.
            </p>
          ) : (
            <>
              <div className="mt-6 space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                  >
                    <div>
                      <p className="font-bold text-slate-700">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-brand-600">
                        {faMoney(item.price)} × {faNum(item.qty)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decrease(item.id)}
                        className="rounded-lg bg-white p-2 shadow-sm"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="w-6 text-center font-black">
                        {faNum(item.qty)}
                      </span>

                      <button
                        onClick={() => increase(item.id)}
                        className="rounded-lg bg-brand-600 p-2 text-white"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-indigo-950 p-5 text-white md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs text-indigo-200">
                    مبلغ کل سفارش
                  </p>

                  <p className="mt-1 text-xl font-black text-gold-300">
                    {faMoney(totalPrice)}
                  </p>
                </div>

                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-6 py-3 font-black text-indigo-950 transition hover:scale-105"
                >
                  ادامه و ثبت سفارش
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
