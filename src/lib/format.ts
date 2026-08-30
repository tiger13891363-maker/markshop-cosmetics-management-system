// Persian (fa-IR) formatting helpers — Jalali dates, Persian digits, Toman

export const faNum = (v: number | string) =>
  Number(v).toLocaleString("fa-IR");

export const faMoney = (v: number) =>
  `${faNum(Math.round(v))} تومان`;

export const faMoneyCompact = (v: number) => {
  const n = Math.round(v);
  if (n >= 1e9)
    return `${(n / 1e9).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} میلیارد تومان`;
  if (n >= 1e6)
    return `${(n / 1e6).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} میلیون تومان`;
  if (n >= 1e3)
    return `${(n / 1e3).toLocaleString("fa-IR", { maximumFractionDigits: 0 })} هزار تومان`;
  return faMoney(n);
};

export const faDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const faDateShort = (iso: string) =>
  new Date(iso).toLocaleDateString("fa-IR", {
    month: "2-digit",
    day: "2-digit",
  });

export const faDateTime = (iso: string) =>
  new Date(iso).toLocaleString("fa-IR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "همین الان";
  const m = s / 60;
  if (m < 60) return `${faNum(Math.floor(m))} دقیقه پیش`;
  const h = m / 60;
  if (h < 24) return `${faNum(Math.floor(h))} ساعت پیش`;
  const d = h / 24;
  if (d < 45) return `${faNum(Math.floor(d))} روز پیش`;
  return faDate(iso);
};

/** Jalali month label for the month `i` months ago (0 = current). */
export const monthLabel = (i: number) =>
  new Date(new Date().getFullYear(), new Date().getMonth() - i, 1).toLocaleDateString(
    "fa-IR",
    { month: "long" }
  );

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
