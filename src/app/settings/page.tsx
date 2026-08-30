"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  Database,
  Globe,
  ImagePlus,
  Info,
  Link2,
  MessageCircle,
  Palette,
  RotateCcw,
  Save,
  Store,
  Trash2,
  User,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { useApp } from "@/store/AppStore";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Field,
  Input,
  Toggle,
} from "@/components/ui";
import type { Accent, Settings } from "@/lib/types";

const ACCENTS: { key: Accent; label: string; grad: string }[] = [
  { key: "classic", label: "کلاسیک مارک‌شاپ", grad: "linear-gradient(135deg,#6C2BD9,#312E81,#2563EB)" },
  { key: "royal", label: "بنفش سلطنتی", grad: "linear-gradient(135deg,#4C1D95,#1E1B4B,#6D28D9)" },
  { key: "azure", label: "آبی آسمانی", grad: "linear-gradient(135deg,#2563EB,#1E3A8A,#0891B2)" },
];

const PALETTE = [
  { name: "بنفش اصلی", hex: "#6C2BD9" },
  { name: "نیلی تیره", hex: "#312E81" },
  { name: "آبی آسمانی", hex: "#2563EB" },
  { name: "طلایی پریمیوم", hex: "#D4AF37" },
  { name: "پس‌زمینه روشن", hex: "#F8FAFC" },
];

function SettingsInner() {
  const { settings, saveSettings, resetData, toast, loading } = useApp();
  const [form, setForm] = useState<Settings>(settings);
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const set = (patch: Partial<Settings>) => setForm((f) => ({ ...f, ...patch }));

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast("error", "فرمت نادرست", "لطفاً یک فایل تصویر انتخاب کنید");
    if (file.size > 1.5 * 1024 * 1024)
      return toast("error", "فایل بزرگ است", "حجم لوگو باید کمتر از ۱.۵ مگابایت باشد");
    const reader = new FileReader();
    reader.onload = () => set({ logo: String(reader.result) });
    reader.onerror = () => toast("error", "خطا در خواندن فایل", "لطفاً دوباره تلاش کنید");
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const save = async () => {
    if (form.shopName.trim().length < 2)
      return toast("error", "نام فروشگاه الزامی است", "نام فروشگاه را وارد کنید");
    setSaving(true);
    await saveSettings(form);
    setSaving(false);
    toast("success", "تنظیمات ذخیره شد", "تغییرات با موفقیت اعمال شد");
  };

  return (
    <Shell
      title="تنظیمات"
      subtitle="پیکربندی فروشگاه و سیستم"
      actions={
        <Button icon={Save} loading={saving} onClick={save}>
          ذخیره تنظیمات
        </Button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Shop info */}
        <Card title="اطلاعات فروشگاه" subtitle="بررسی‌کننده‌ها و مشتریان این اطلاعات را می‌بینند">
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              {form.logo ? (
                <img
                  src={form.logo}
                  alt="لوگو"
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand-100"
                />
              ) : (
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white"
                  style={{ background: "var(--hero-grad)" }}
                >
                  M
                </span>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={ImagePlus}
                  onClick={() => fileRef.current?.click()}
                >
                  آپلود لوگو
                </Button>
                {form.logo && (
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => set({ logo: "" })}>
                    حذف لوگو
                  </Button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onLogo} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="نام فروشگاه" required>
                <Input value={form.shopName} onChange={(e) => set({ shopName: e.target.value })} />
              </Field>
              <Field label="شماره تماس فروشگاه">
                <Input dir="ltr" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
              </Field>
            </div>
            <Field label="شعار فروشگاه">
              <Input value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} />
            </Field>
            <Field label="آدرس فروشگاه">
              <Input value={form.address} onChange={(e) => set({ address: e.target.value })} />
            </Field>
          </div>
        </Card>

        {/* Admin info */}
        <div className="space-y-5">
          <Card title="اطلاعات مدیر" subtitle="پروفایل کاربر مدیریت">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="نام و نام خانوادگی">
                <Input value={form.adminName} onChange={(e) => set({ adminName: e.target.value })} />
              </Field>
              <Field label="شماره تلفن">
                <Input dir="ltr" value={form.adminPhone} onChange={(e) => set({ adminPhone: e.target.value })} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="ایمیل">
                  <Input dir="ltr" type="email" value={form.adminEmail} onChange={(e) => set({ adminEmail: e.target.value })} />
                </Field>
              </div>
            </div>
          </Card>

          <Card title="تنظیمات اعلان‌ها" subtitle="کدام رویدادها در بخش اعلان‌ها نمایش داده شوند">
            <div className="space-y-1">
              <Toggle
                checked={form.notNewOrder}
                onChange={(v) => set({ notNewOrder: v })}
                label="اعلان سفارش جدید"
                desc="به‌محض ثبت هر سفارش جدید خبردار شوید"
              />
              <Toggle
                checked={form.notLowStock}
                onChange={(v) => set({ notLowStock: v })}
                label="اعلان موجودی کم"
                desc="وقتی موجودی محصول کمتر از ۱۰ عدد شد"
              />
              <Toggle
                checked={form.notDailySummary}
                onChange={(v) => set({ notDailySummary: v })}
                label="خلاصه گزارش روزانه"
                desc="پایان هر روز، خلاصه فروش را دریافت کنید"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Appearance & brand */}
      <Card
        className="mt-5"
        title="ظاهر، رنگ و برند"
        subtitle="تغییر پوسته و هویت بصری پنل مدیریت"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Palette className="h-3.5 w-3.5 text-brand-500" />
              پوسته رنگی پنل
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {ACCENTS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => set({ accent: a.key })}
                  className={`rounded-2xl p-2 text-right ring-2 transition ${
                    form.accent === a.key ? "ring-brand-500 bg-brand-50/50" : "ring-slate-100 hover:ring-slate-200"
                  }`}
                >
                  <span className="block h-12 rounded-xl" style={{ background: a.grad }} />
                  <span className="mt-2 flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold text-slate-600">{a.label}</span>
                    {form.accent === a.key && (
                      <Check className="h-3.5 w-3.5 text-brand-600" />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <Toggle
                checked={form.goldAccent}
                onChange={(v) => set({ goldAccent: v })}
                label="اکسنت طلایی پریمیوم"
                desc="استفاده از جزئیات طلایی در المان‌های لوکس"
              />
            </div>
          </div>
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Store className="h-3.5 w-3.5 text-brand-500" />
              پالت رنگ برند مارک‌شاپ
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PALETTE.map((c) => (
                <div key={c.hex} className="overflow-hidden rounded-xl ring-1 ring-slate-100">
                  <span className="block h-12" style={{ background: c.hex }} />
                  <span className="block bg-white px-2 py-1.5">
                    <span className="block text-[10px] font-bold text-slate-600">{c.name}</span>
                    <span className="block text-[10px] text-slate-400" dir="ltr">{c.hex}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Data connections (future integrations — UI only) */}
      <Card
        className="mt-5"
        title="اتصال داده‌ها"
        subtitle="پیکربندی اتصال به منابع واقعی — فعلاً آماده‌سازی شده، متصل نیست"
      >
        <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-azure-50 px-4 py-3 text-xs leading-6 text-azure-900 ring-1 ring-azure-100">
          <Info className="mt-1 h-4 w-4 shrink-0 text-azure-600" />
          <p>
            در این نسخه از برنامه، همه داده‌ها به‌صورت محلی (Mock Data) ذخیره می‌شوند.
            این بخش برای اتصال آینده به REST API، دیتابیس و Mixin API طراحی شده است؛
            پس از فعال‌سازی، اطلاعات واردشده در اینجا برای برقراری اتصال استفاده خواهد شد.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl p-4 ring-1 ring-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <span className="rounded-lg bg-azure-50 p-2 text-azure-600"><Globe className="h-4 w-4" /></span>
                REST API
              </span>
              <Badge className="bg-gold-100 text-gold-600 ring-gold-300/50">آماده اتصال</Badge>
            </div>
            <div className="mt-3 space-y-2.5">
              <Input dir="ltr" placeholder="https://api.markshop.ir/v1" value={form.restUrl} onChange={(e) => set({ restUrl: e.target.value })} />
              <Input dir="ltr" type="password" placeholder="API Token" value={form.restToken} onChange={(e) => set({ restToken: e.target.value })} />
              <Button variant="outline" size="sm" icon={Link2} disabled className="w-full">
                تست اتصال
              </Button>
              <p className="text-center text-[10px] text-slate-400">پس از فعال‌سازی سرویس، قابل استفاده خواهد بود</p>
            </div>
          </div>
          <div className="rounded-2xl p-4 ring-1 ring-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <span className="rounded-lg bg-brand-50 p-2 text-brand-500"><Database className="h-4 w-4" /></span>
                دیتابیس
              </span>
              <Badge className="bg-gold-100 text-gold-600 ring-gold-300/50">آماده اتصال</Badge>
            </div>
            <div className="mt-3 space-y-2.5">
              <Input dir="ltr" placeholder="postgres://host:5432/markshop" value={form.dbUrl} onChange={(e) => set({ dbUrl: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input dir="ltr" placeholder="کاربر" value={form.dbUser} onChange={(e) => set({ dbUser: e.target.value })} />
                <Input dir="ltr" type="password" placeholder="رمز" value={form.dbPass} onChange={(e) => set({ dbPass: e.target.value })} />
              </div>
              <Button variant="outline" size="sm" icon={Link2} disabled className="w-full">
                تست اتصال
              </Button>
              <p className="text-center text-[10px] text-slate-400">پس از فعال‌سازی سرویس، قابل استفاده خواهد بود</p>
            </div>
          </div>
          <div className="rounded-2xl p-4 ring-1 ring-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><MessageCircle className="h-4 w-4" /></span>
                Mixin API
              </span>
              <Badge className="bg-gold-100 text-gold-600 ring-gold-300/50">آماده اتصال</Badge>
            </div>
            <div className="mt-3 space-y-2.5">
              <Input dir="ltr" placeholder="https://api.mixin.one" value={form.mixUrl} onChange={(e) => set({ mixUrl: e.target.value })} />
              <Input dir="ltr" type="password" placeholder="Private Key / Token" value={form.mixToken} onChange={(e) => set({ mixToken: e.target.value })} />
              <Button variant="outline" size="sm" icon={Link2} disabled className="w-full">
                تست اتصال
              </Button>
              <p className="text-center text-[10px] text-slate-400">پس از فعال‌سازی سرویس، قابل استفاده خواهد بود</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="mt-5" title="منطقه حساس" subtitle="عملیات بازگشت‌ناپذیر">
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl bg-rose-50/50 p-4 ring-1 ring-rose-100 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-white p-2.5 text-rose-500 ring-1 ring-rose-100">
              <RotateCcw className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-700">بازنشانی داده‌های نمونه</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-400">
                همه تغییرات محلی پاک شده و داده‌های اولیه (Mock) بازیابی می‌شوند.
              </p>
            </div>
          </div>
          <Button variant="danger" icon={RotateCcw} onClick={() => setResetOpen(true)} disabled={loading}>
            بازنشانی
          </Button>
        </div>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button size="lg" icon={Save} loading={saving} onClick={save}>
          ذخیره تنظیمات
        </Button>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="بازنشانی داده‌ها"
        message="آیا مطمئن هستید؟ همه تغییرات محلی (سفارش‌ها، محصولات، مشتریان و تنظیمات) حذف و داده‌های نمونه اولیه بازیابی می‌شود."
        confirmText="بازنشانی"
        onConfirm={() => resetData()}
        onClose={() => setResetOpen(false)}
      />
    </Shell>
  );
}

export default function SettingsPage() {
  return <SettingsInner />;
}
