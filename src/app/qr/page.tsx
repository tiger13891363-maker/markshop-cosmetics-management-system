"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import {
  Copy,
  Download,
  ExternalLink,
  Info,
  QrCode,
  ScanLine,
  Smartphone,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { useApp } from "@/store/AppStore";
import { Button, Card } from "@/components/ui";

function QR() {
  const { toast } = useApp();
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined")
      setUrl(`${window.location.origin}/register`);
  }, []);

  const copy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast("success", "لینک کپی شد", "آدرس صفحه ثبت سفارش در کلیپ‌بورد کپی شد");
    } catch {
      toast("error", "کپی ناموفق بود", "لطفاً آدرس را دستی کپی کنید");
    }
  };

  const download = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    try {
      const xml = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        const S = 800;
        const canvas = document.createElement("canvas");
        canvas.width = S;
        canvas.height = S;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, S, S);
        ctx.drawImage(img, 60, 60, S - 120, S - 120);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "markshop-register-qr.png";
          a.click();
          URL.revokeObjectURL(a.href);
          toast("success", "دانلود آغاز شد", "کد QR با کیفیت چاپ ذخیره شد");
        }, "image/png");
      };
      img.onerror = () =>
        toast("error", "دریافت خطا", "ساخت تصویر ممکن نشد، دوباره تلاش کنید");
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
    } catch {
      toast("error", "دریافت خطا", "ساخت تصویر ممکن نشد، دوباره تلاش کنید");
    }
  };

  return (
    <Shell title="کد QR" subtitle="کد اختصاصی صفحه ثبت سفارش">
      <div className="grid gap-5 lg:grid-cols-[440px_1fr]">
        <Card title="کد QR ثبت سفارش" subtitle="مشتریان با اسکن این کد، سفارش خود را ثبت می‌کنند">
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* decorative corners */}
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-tl-xl" style={{ background: "var(--hero-grad)" }} />
              <span className="absolute -top-2 -left-2 h-5 w-5 rounded-tr-xl bg-gold-400" />
              <span className="absolute -bottom-2 -right-2 h-5 w-5 rounded-br-xl bg-gold-400" />
              <span className="absolute -bottom-2 -left-2 h-5 w-5 rounded-bl-xl" style={{ background: "var(--hero-grad)" }} />
              <div
                ref={qrRef}
                className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-inner"
              >
                {url ? (
                  <QRCode value={url} size={230} bgColor="#ffffff" fgColor="#312E81" />
                ) : (
                  <div className="h-[230px] w-[230px] animate-pulse rounded-lg bg-slate-100" />
                )}
              </div>
            </div>
            <p className="mt-5 w-full break-all rounded-xl bg-slate-50 px-4 py-2.5 text-center text-[11px] font-semibold text-slate-500 ring-1 ring-slate-100" dir="ltr">
              {url || "…"}
            </p>
            <div className="mt-5 grid w-full grid-cols-3 gap-2">
              <Button variant="outline" icon={Copy} onClick={copy}>
                {copied ? "کپی شد" : "کپی لینک"}
              </Button>
              <Button icon={Download} onClick={download}>
                دانلود QR
              </Button>
              <Button
                variant="ghost"
                icon={ExternalLink}
                onClick={() => window.open(url, "_blank")}
              >
                باز کردن
              </Button>
            </div>
            <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-5 text-slate-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-azure-600" />
              این کد به صفحه ثبت سفارش فروشگاه (مسیر /register) اشاره دارد. در نسخه
              نهایی، با دامنه واقعی فروشگاه جایگزین می‌شود.
            </p>
          </div>
        </Card>

        <div className="space-y-5">
          <Card title="راهنمای استفاده" subtitle="نکات چاپ و نصب">
            <ul className="space-y-4">
              {[
                {
                  icon: QrCode,
                  t: "حداقل ابعاد چاپ",
                  d: "کد را با ابعادی حداقل ۸×۸ سانتی‌متر و با کیفیت چاپ بالا چاپ کنید تا اسکن سریع انجام شود.",
                },
                {
                  icon: ScanLine,
                  t: "محل نصب مناسب",
                  d: "کد را در ورودی فروشگاه، روی ویترین یا داخل پاکت محصولات قرار دهید.",
                },
                {
                  icon: Smartphone,
                  t: "بدون نیاز به نصب اپلیکیشن",
                  d: "مشتری کافی است با دوربین گوشی اسکن کند؛ فرم ثبت سفارش مستقیماً در مرورگر باز می‌شود.",
                },
              ].map((x, i) => (
                <li key={i} className="flex gap-3.5">
                  <span className="mt-0.5 shrink-0 rounded-xl bg-brand-50 p-2.5 text-brand-500">
                    <x.icon className="h-4.5 w-4.5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-slate-700">{x.t}</span>
                    <span className="mt-0.5 block text-xs leading-6 text-slate-400">{x.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="مسیر سفارش مشتری" subtitle="مراحل پس از اسکن">
            <ol className="space-y-3">
              {[
                "مشتری کد QR را با گوشی اسکن می‌کند",
                "فرم ثبت سفارش مارک‌شاپ در مرورگر باز می‌شود",
                "محصول، تعداد و اطلاعات تماس انتخاب می‌شود",
                "سفارش با کد پیگیری در پنل مدیریت ثبت می‌شود",
              ].map((s, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-azure-600 text-[11px] font-black text-white">
                    {["۱", "۲", "۳", "۴"][i]}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">{s}</span>
                  {i < 3 && <span className="mr-2 h-px flex-1 bg-gradient-to-l from-slate-200 to-transparent" />}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </Shell>
  );
}

export default function QRPage() {
  return <QR />;
}
