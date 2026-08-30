"use client";

import React, { useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Search,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/store/AppStore";
import { ORDER_STATUS } from "@/lib/mock-data";
import type { OrderStatus } from "@/lib/types";
import { faNum } from "@/lib/format";

/* ── Button ─────────────────────────────────────────────── */
type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
const V: Record<Variant, string> = {
  primary: "bg-azure-600 text-white hover:bg-azure-700 shadow-sm shadow-azure-600/25",
  secondary: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/25",
  outline: "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
  ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
  danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/25",
  gold: "bg-gold-400 text-indigo-950 hover:bg-gold-500 shadow-sm shadow-gold-400/30",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: LucideIcon;
}) {
  const sz =
    size === "sm"
      ? "px-3 py-1.5 text-xs gap-1.5"
      : size === "lg"
        ? "px-6 py-3 text-sm gap-2"
        : "px-4 py-2.5 text-sm gap-2";
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none ${V[variant]} ${sz} ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      {children}
    </button>
  );
}

export function IconBtn({
  icon: Icon,
  label,
  tone = "slate",
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  tone?: "slate" | "danger" | "brand" | "gold";
  onClick?: () => void;
}) {
  const t =
    tone === "danger"
      ? "text-rose-500 hover:bg-rose-50"
      : tone === "brand"
        ? "text-brand-500 hover:bg-brand-500/10"
        : tone === "gold"
          ? "text-gold-500 hover:bg-gold-400/15"
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-600";
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`rounded-lg p-2 transition-colors ${t}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/* ── Card ───────────────────────────────────────────────── */
export function Card({
  title,
  subtitle,
  action,
  className = "",
  bodyClass = "p-5",
  children,
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClass?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(49,46,129,0.05),0_8px_24px_-12px_rgba(49,46,129,0.12)] ${className}`}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

/* ── Badges ─────────────────────────────────────────────── */
export function Badge({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const m = ORDER_STATUS[status];
  return (
    <Badge className={m.badge}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </Badge>
  );
}

/* ── Avatar ────────────────────────────────────────────── */
const AV_COLORS = [
  "bg-brand-500",
  "bg-azure-600",
  "bg-indigo-700",
  "bg-gold-500",
  "bg-violet-600",
  "bg-cyan-600",
];
export function Avatar({
  name,
  size = "md",
  src,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  src?: string;
}) {
  const s =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";
  const color = AV_COLORS[(name.charCodeAt(0) || 0) % AV_COLORS.length];
  if (src)
    return (
      <img
        src={src}
        alt={name}
        className={`${s} rounded-full object-cover ring-2 ring-white`}
      />
    );
  return (
    <span
      className={`inline-flex ${s} shrink-0 items-center justify-center rounded-full font-bold text-white ${color}`}
    >
      {name.trim().charAt(0)}
    </span>
  );
}

/* ── Product image with graceful fallback ───────────────── */
export function ProductImage({
  src,
  alt,
  className = "",
  iconSize = "h-8 w-8",
}: {
  src: string;
  alt: string;
  className?: string;
  iconSize?: string;
}) {
  const [err, setErr] = React.useState(false);
  if (!src || err)
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-brand-500/15 via-indigo-100 to-azure-600/15 ${className}`}
      >
        <Sparkles className={`${iconSize} text-brand-500/50`} />
      </div>
    );
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErr(true)}
      className={`object-cover ${className}`}
    />
  );
}

/* ── Modal ──────────────────────────────────────────────── */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  wide = false,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  wide?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-indigo-950/45 backdrop-blur-[2px] animate-fade"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-pop sm:rounded-2xl ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

/* ── Confirm dialog ─────────────────────────────────────── */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "حذف",
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            انصراف
          </Button>
          <Button
            variant="danger"
            icon={AlertTriangle}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-rose-50 p-2.5 text-rose-500">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="pt-1 text-sm leading-7 text-slate-600">{message}</p>
      </div>
    </Modal>
  );
}

/* ── Form fields ────────────────────────────────────────── */
const inputBase =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400";
const inputOk =
  "border-slate-200 focus:border-azure-500 focus:ring-azure-500/15";
const inputErr = "border-rose-300 focus:border-rose-400 focus:ring-rose-400/15";

export function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-[11px] font-medium text-rose-500">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
}

export function Input({
  error,
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...rest}
      className={`${inputBase} ${error ? inputErr : inputOk} ${className}`}
    />
  );
}

export function Select({
  error,
  className = "",
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      {...rest}
      className={`${inputBase} ${error ? inputErr : inputOk} cursor-pointer ${className}`}
    >
      {children}
    </select>
  );
}

export function Textarea({
  error,
  className = "",
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      {...rest}
      rows={3}
      className={`${inputBase} resize-none ${error ? inputErr : inputOk} ${className}`}
    />
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "جستجو…",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputBase} ${inputOk} pr-9`}
      />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl px-1 py-2.5 text-right transition hover:bg-slate-50"
    >
      <span>
        <span className="block text-sm font-semibold text-slate-700">
          {label}
        </span>
        {desc && <span className="mt-0.5 block text-xs text-slate-400">{desc}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-azure-600" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "right-[22px]" : "right-0.5"}`}
        />
      </span>
    </button>
  );
}

/* ── Stat card ──────────────────────────────────────────── */
const TONES: Record<string, string> = {
  brand: "from-brand-500 to-indigo-700 text-white",
  azure: "from-azure-500 to-blue-700 text-white",
  gold: "from-gold-400 to-gold-500 text-indigo-950",
  emerald: "from-emerald-500 to-teal-600 text-white",
  rose: "from-rose-500 to-pink-600 text-white",
  violet: "from-violet-500 to-brand-500 text-white",
};
export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "brand",
  up = true,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  tone?: keyof typeof TONES;
  up?: boolean;
}) {
  return (
    <div className="group rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(49,46,129,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-10px_rgba(49,46,129,0.25)]">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-500">
            {label}
          </p>
          <p className="mt-1.5 truncate text-lg font-extrabold tracking-tight text-slate-800">
            {value}
          </p>
          {sub && (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <span className={up ? "text-emerald-500" : "text-rose-500"}>
                {up ? "▲" : "▼"}
              </span>
              {sub}
            </p>
          )}
        </div>
        <span
          className={`rounded-xl bg-gradient-to-br p-2.5 shadow-sm transition-transform group-hover:scale-110 ${TONES[tone]}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────── */
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
      <span className="rounded-2xl bg-white p-4 text-brand-500 shadow-sm ring-1 ring-slate-100">
        <Icon className="h-7 w-7" />
      </span>
      <h4 className="mt-2 text-sm font-bold text-slate-700">{title}</h4>
      <p className="max-w-xs text-xs leading-6 text-slate-400">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────────── */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-5 animate-fade">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

/* ── Pagination ─────────────────────────────────────────── */
export function Pagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
      <p className="text-xs text-slate-400">
        صفحه {faNum(page)} از {faNum(pages)}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(Math.min(pages, page + 1))}
          disabled={page >= pages}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
          aria-label="صفحه بعدی"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`h-8 w-8 rounded-lg text-xs font-bold transition ${p === page ? "bg-brand-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}
          >
            {faNum(p)}
          </button>
        ))}
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
          aria-label="صفحه قبل"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Toasts ─────────────────────────────────────────────── */
export function Toasts() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 left-5 z-[80] flex w-[min(92vw,340px)] flex-col gap-2">
      {toasts.map((t) => {
        const Icon =
          t.type === "success"
            ? CheckCircle2
            : t.type === "error"
              ? AlertTriangle
              : Info;
        const tone =
          t.type === "success"
            ? "text-emerald-500 bg-emerald-50"
            : t.type === "error"
              ? "text-rose-500 bg-rose-50"
              : "text-azure-600 bg-azure-50";
        return (
          <div
            key={t.id}
            className="flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-slate-200/70 animate-toast"
          >
            <span className={`rounded-xl p-2 ${tone}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-bold text-slate-800">{t.title}</p>
              {t.message && (
                <p className="mt-0.5 text-xs leading-5 text-slate-400">
                  {t.message}
                </p>
              )}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="rounded-md p-1 text-slate-300 transition hover:text-slate-500"
              aria-label="بستن"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
