"use client";

import React, { useId } from "react";
import { faMoneyCompact, faNum } from "@/lib/format";

/* ── Vertical bar chart (div-based, RTL aware) ──────────── */
export function BarChart({
  data,
  money = true,
  height = 190,
}: {
  data: { label: string; value: number }[];
  money?: boolean;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const step = Math.max(1, Math.ceil(data.length / 7));
  return (
    <div>
      <div className="flex items-end gap-[6px]" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="group relative flex h-full flex-1 flex-col items-center justify-end">
            <div className="pointer-events-none absolute -top-9 right-1/2 z-10 hidden translate-x-1/2 whitespace-nowrap rounded-lg bg-indigo-950 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg group-hover:block">
              <span className="block text-center">{d.label}</span>
              <span className="block text-center text-gold-300">
                {money ? faMoneyCompact(d.value) : faNum(d.value)}
              </span>
            </div>
            <div
              className="w-full max-w-[26px] rounded-t-md bg-gradient-to-t from-indigo-800 via-brand-500 to-azure-500 opacity-85 transition-all duration-300 group-hover:opacity-100 group-hover:shadow-[0_0_14px_rgba(108,43,217,0.45)]"
              style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-[6px] border-t border-slate-100 pt-2">
        {data.map((d, i) => (
          <span key={i} className="flex-1 truncate text-center text-[10px] text-slate-400">
            {i % step === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Donut chart ────────────────────────────────────────── */
export function DonutChart({
  items,
  centerTitle,
  centerValue,
}: {
  items: { label: string; value: number; color: string }[];
  centerTitle: string;
  centerValue: string;
}) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const size = 150;
  const th = 18;
  const r = (size - th) / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={th}
          />
          {items.map((it, i) => {
            const frac = it.value / total;
            const off = acc;
            acc += frac;
            if (it.value === 0) return null;
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={it.color}
                strokeWidth={th}
                strokeLinecap="butt"
                strokeDasharray={`${Math.max(frac * C - 2, 0.5)} ${C}`}
                strokeDashoffset={-off * C}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold text-slate-800">
            {centerValue}
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            {centerTitle}
          </span>
        </div>
      </div>
      <ul className="min-w-[150px] flex-1 space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: it.color }}
            />
            <span className="flex-1 truncate text-slate-500">{it.label}</span>
            <span className="font-bold text-slate-700">{faNum(it.value)}</span>
            <span className="w-9 text-left text-[10px] text-slate-400">
              {faNum(Math.round((it.value / total) * 100))}٪
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Area / line chart (SVG) ────────────────────────────── */
export function AreaChart({
  data,
  labels,
  height = 160,
  gold = false,
}: {
  data: number[];
  labels: string[];
  height?: number;
  gold?: boolean;
}) {
  const gid = useId().replace(/[:]/g, "");
  const W = 320;
  const H = 110;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min || 1)) * (H - 14) - 6;
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const c1 = gold ? "#D4AF37" : "#6C2BD9";
  const c2 = gold ? "#B8860B" : "#2563EB";
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c1} stopOpacity="0.35" />
            <stop offset="100%" stopColor={c2} stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id={`${gid}l`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#F1F5F9" strokeWidth="1" />
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke={`url(#${gid}l)`} strokeWidth="2.5" strokeLinecap="round" />
        <circle
          cx={pts[pts.length - 1][0]}
          cy={pts[pts.length - 1][1]}
          r="4"
          fill={c2}
          stroke="#fff"
          strokeWidth="2"
        />
      </svg>
      <div className="mt-2 flex justify-between border-t border-slate-100 pt-2">
        {labels.map((l, i) => (
          <span key={i} className="text-[10px] text-slate-400">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Horizontal bars ────────────────────────────────────── */
export function HBars({
  items,
  gold = false,
  format,
}: {
  items: { label: string; value: number; sub?: string }[];
  gold?: boolean;
  format?: (v: number) => string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const fmt = format ?? ((v: number) => faNum(v));
  return (
    <ul className="space-y-4">
      {items.map((it, i) => (
        <li key={i}>
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-600">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold ${i === 0 ? "bg-gold-400 text-indigo-950" : "bg-slate-100 text-slate-500"}`}
              >
                {faNum(i + 1)}
              </span>
              <span className="truncate">{it.label}</span>
            </span>
            <span className="shrink-0 font-bold text-slate-700">
              {fmt(it.value)}
              {it.sub && (
                <span className="mr-1 text-[10px] font-medium text-slate-400">
                  {it.sub}
                </span>
              )}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${gold ? "bg-gradient-to-l from-gold-300 to-gold-500" : "bg-gradient-to-l from-brand-500 to-azure-500"}`}
              style={{ width: `${(it.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
