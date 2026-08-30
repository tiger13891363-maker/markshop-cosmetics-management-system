"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { useApp } from "@/store/AppStore";
import {
  Button,
  Field,
  Input,
  ProductImage,
  Select,
  Textarea,
} from "@/components/ui";
import type { Order } from "@/lib/types";
import { faDate, faMoney, faNum } from "@/lib/format";

const STEPS = ["انتخاب محصول", "اطلاعات شما", "تأیید و ثبت"];

function Register() {
  const { loading, products, registerOrder, toast, settings } = useApp();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    productId: "",
    qty: 1,
    address: "",
    notes: "",
  });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Order | null>(null);

  const buyable = useMemo(
    () => products.filter((p) => p.status === "active" && p.stock > 0),
    [products]
  );
  const prod = buyable.find((p) => p.id === form.productId);
  const maxQty = prod ? Math.min(prod.stock, 99) : 99;
  const qty = Math.min(form.qty, maxQty);
  const total = prod ? prod.price * qty : 0;

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = "نام و نام خانوادگی را کامل وارد کنید";
    if (!/^09\d{9}$/.test(form.phone.trim()))
      e.phone = "شماره تلفن معتبر نیست (مثال: 09121234567)";
    if (!form.productId) e.productId = "لطفاً یک محصول انتخاب کنید";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate() || !prod) return;
    setSubmitting(true);
    try {
      const order = await registerOrder({
        name: form.name,
        phone: form.phone,
        items: [
          { productId: prod.id, name: prod.name, qty, price: prod.price },
        ],
        address: form.address,
        notes: form.notes,
      });
      setDone(order);
      toast("success", "سفارش ثبت شد", `کد سفارش شما: ${order.code}`);
    } catch {
      toast("error", "خطا در ثبت سفارش", "لطفاً دوباره تلاش کنید");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setDone(null);
    setForm({ name: "", phone: "", productId: "", qty: 1, address: "", notes: "" });
    setErrs({});
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50">
        <div style={{ background: "var(--hero-grad)" }} className="h-52" />
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="h-96 animate-pulse rounded-2xl bg-slate-200/70" />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* Hero */}
      <header
        style={{ background: "var(--hero-grad)" }}
        className="relative overflow-hidden px-4 pt-10 pb-20"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(212,175,55,0.4) 0, transparent 35%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-2xl font-black text-white ring-1 ring-white/25">
              M
              <span className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-gold-400" />
            </span>
            <div>
              <p className="text-lg font-black text-white">{settings.shopName}</p>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-gold-300">
                MARKSHOP
              </p>
            </div>
          </div>
          <h1 className="mt-7 text-2xl font-black text-white md:text-3xl">
            ثبت سفارش آنلاین
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-7 text-indigo-100/90">
            محصول موردنظرتان را انتخاب کنید و اطلاعات خود را وارد نمایید؛ کارشناسان
            ما در اسرع وقت با شما تماس می‌گیرند.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-bold text-white ring-1 ring-white/20"
              >
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold-400 text-[9px] font-black text-indigo-950">
                  {faNum(i + 1)}
                </span>
                {s}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-12 max-w-5xl px-4">
        {done ? (
          /* ── Success ─ */
          <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200/70 animate-pop">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 shadow-lg shadow-gold-400/40">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </span>
            <h2 className="mt-5 text-xl font-black text-slate-800">
              سفارش شما با موفقیت ثبت شد!
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              کد پیگیری سفارش شما:
              <span className="mx-1.5 rounded-lg bg-brand-50 px-2.5 py-1 font-black text-brand-700" dir="ltr">
                {done.code}
              </span>
            </p>
            <div className="mt-5 grid gap-2 text-right">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <span className="text-slate-500">محصول</span>
                <span className="font-bold text-slate-700">{done.items[0]?.name}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <span className="text-slate-500">تاریخ ثبت</span>
                <span className="font-bold text-slate-700">{faDate(done.date)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gold-100/60 px-4 py-3 text-sm ring-1 ring-gold-300/40">
                <span className="font-semibold text-gold-600">مبلغ کل</span>
                <span className="font-black text-indigo-950">{faMoney(done.total)}</span>
              </div>
            </div>
            <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Truck className="h-3.5 w-3.5 text-azure-600" />
              کارشناسان مارک‌شاپ به‌زودی برای هماهنگی ارسال با شما تماس می‌گیرند
            </p>
            <Button size="lg" icon={RotateCcw} className="mt-6 w-full" onClick={reset}>
              ثبت سفارش جدید
            </Button>
          </div>
        ) : (
          /* ── Form ─ */
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200/70 lg:col-span-2">
              <h2 className="text-base font-black text-slate-800">فرم ثبت سفارش</h2>
              <p className="mt-1 text-xs text-slate-400">
                تمام فیلدهای ستاره‌دار الزامی هستند
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="نام و نام خانوادگی" required error={errs.name}>
                    <Input
                      value={form.name}
                      error={!!errs.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="مثلاً: سارا محمدی"
                    />
                  </Field>
                </div>
                <Field label="شماره تلفن" required error={errs.phone}>
                  <Input
                    dir="ltr"
                    value={form.phone}
                    error={!!errs.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="09121234567"
                  />
                </Field>
                <Field label="انتخاب محصول" required error={errs.productId}>
                  <Select
                    value={form.productId}
                    error={!!errs.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value, qty: 1 })}
                  >
                    <option value="">— انتخاب کنید —</option>
                    {buyable.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {faMoney(p.price)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="تعداد" hint={prod ? `حداکثر ${faNum(maxQty)} عدد` : undefined}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, qty: Math.max(1, qty - 1) })}
                      className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50"
                      aria-label="کاهش"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <Input
                      type="number"
                      min={1}
                      max={maxQty}
                      value={qty}
                      onChange={(e) =>
                        setForm({ ...form, qty: Number(e.target.value) || 1 })
                      }
                      className="text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, qty: Math.min(maxQty, qty + 1) })}
                      className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50"
                      aria-label="افزایش"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </Field>
                <Field label="آدرس تحویل (اختیاری)">
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="استان، شهر، محله و خیابان"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="توضیحات سفارش (اختیاری)">
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="درخواست یا نکته‌ای دارید؟ اینجا بنویسید…"
                    />
                  </Field>
                </div>
              </div>
              <Button
                size="lg"
                icon={ShoppingBag}
                loading={submitting}
                className="mt-6 w-full"
                onClick={submit}
              >
                {submitting ? "در حال ثبت سفارش…" : "ثبت سفارش"}
              </Button>
            </div>

            {/* Summary aside */}
            <div className="space-y-4">
              <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200/70">
                <h3 className="text-sm font-black text-slate-700">خلاصه سفارش</h3>
                {prod ? (
                  <div className="mt-4">
                    <ProductImage
                      src={prod.image}
                      alt={prod.name}
                      className="h-36 w-full rounded-2xl"
                    />
                    <p className="mt-3 text-sm font-bold text-slate-700">{prod.name}</p>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>قیمت واحد</span>
                        <span className="font-semibold">{faMoney(prod.price)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>تعداد</span>
                        <span className="font-semibold">{faNum(qty)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>موجودی</span>
                        <span className="font-semibold">{faNum(prod.stock)} عدد</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-dashed border-slate-200 pt-4">
                      <span className="text-xs font-bold text-slate-500">مبلغ کل</span>
                      <span className="text-base font-black text-brand-700">
                        {faMoney(total)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center">
                    <Sparkles className="h-6 w-6 text-slate-300" />
                    <p className="text-xs text-slate-400">
                      پس از انتخاب محصول،
                      <br />
                      خلاصه سفارش اینجا نمایش داده می‌شود
                    </p>
                  </div>
                )}
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200/70">
                <ul className="space-y-3 text-xs font-semibold text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    ضمانت اصالت همه محصولات
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="rounded-lg bg-azure-50 p-2 text-azure-600">
                      <Truck className="h-4 w-4" />
                    </span>
                    ارسال به سراسر کشور
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="rounded-lg bg-gold-100 p-2 text-gold-600">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    پشتیبانی تخصصی آرایشی
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-10 text-center text-[11px] text-slate-400">
          © {settings.shopName} — محصولات آرایشی و بهداشتی | این صفحه از طریق کد QR فروشگاه به شما نمایش داده می‌شود
        </footer>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return <Register />;
}
