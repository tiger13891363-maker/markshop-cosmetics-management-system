"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  MapPin,
  Package,
  Pencil,
  Phone,
  RotateCcw,
  Trash2,
  User,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { useApp } from "@/store/AppStore";
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  IconBtn,
  Input,
  Modal,
  PageSkeleton,
  Pagination,
  SearchInput,
  Select,
  Skeleton,
  StatusBadge,
  Textarea,
} from "@/components/ui";
import { ORDER_STATUS, STATUS_ORDER } from "@/lib/mock-data";
import type { Order, OrderStatus } from "@/lib/types";
import { faDate, faDateTime, faMoney, faNum } from "@/lib/format";

const FLOW: OrderStatus[] = ["new", "processing", "ready", "shipped", "completed"];
const PAGE_SIZE = 8;

function StatusStepper({ status }: { status: OrderStatus }) {
  const idx = status === "cancelled" ? -1 : FLOW.indexOf(status);
  if (idx === -1)
    return (
      <div className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">
        این سفارش لغو شده است
      </div>
    );
  return (
    <div className="flex items-center">
      {FLOW.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-extrabold transition ${
                i < idx
                  ? "bg-brand-500 text-white"
                  : i === idx
                    ? "bg-azure-600 text-white ring-4 ring-azure-600/15"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {i < idx ? "✓" : faNum(i + 1)}
            </span>
            <span
              className={`whitespace-nowrap text-[9px] font-bold ${
                i <= idx ? "text-brand-600" : "text-slate-400"
              }`}
            >
              {ORDER_STATUS[s].label}
            </span>
          </div>
          {i < FLOW.length - 1 && (
            <span
              className={`mb-5 h-0.5 flex-1 rounded ${i < idx ? "bg-brand-500" : "bg-slate-100"}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function OrdersInner() {
  const {
    loading,
    orders,
    customers,
    updateOrder,
    deleteOrder,
    toast,
  } = useApp();
  const params = useSearchParams();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [cid, setCid] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const [view, setView] = useState<Order | null>(null);
  const [edit, setEdit] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState({
    status: "new" as OrderStatus,
    customerName: "",
    customerPhone: "",
    address: "",
    notes: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [del, setDel] = useState<Order | null>(null);
  const [delBusy, setDelBusy] = useState(false);

  useEffect(() => {
    const v = params.get("q");
    if (v) setQ(v);
  }, [params]);

  const filtered = useMemo(() => {
    const s = q.trim();
    return [...orders]
      .filter((o) => {
        if (s) {
          const hit =
            o.code.toLowerCase().includes(s.toLowerCase()) ||
            o.customerName.includes(s) ||
            o.customerPhone.includes(s) ||
            o.items.some((i) => i.name.includes(s));
          if (!hit) return false;
        }
        if (status !== "all" && o.status !== status) return false;
        if (cid !== "all" && o.customerId !== cid) return false;
        const day = o.date.slice(0, 10);
        if (from && day < from) return false;
        if (to && day > to) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [orders, q, status, cid, from, to]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openEdit = (o: Order) => {
    setEditForm({
      status: o.status,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      address: o.address ?? "",
      notes: o.notes ?? "",
    });
    setEdit(o);
  };

  const saveEdit = async () => {
    if (!edit) return;
    if (editForm.customerName.trim().length < 3)
      return toast("error", "خطا", "نام مشتری را کامل وارد کنید");
    setEditSaving(true);
    await updateOrder(edit.id, {
      status: editForm.status,
      customerName: editForm.customerName.trim(),
      customerPhone: editForm.customerPhone.trim(),
      address: editForm.address.trim() || undefined,
      notes: editForm.notes.trim() || undefined,
    });
    setEditSaving(false);
    setEdit(null);
    setView((v) => (v && v.id === edit.id ? { ...v, ...editForm, address: editForm.address || undefined, notes: editForm.notes || undefined } : v));
    toast("success", "سفارش به‌روزرسانی شد", `تغییرات سفارش ${edit.code} ذخیره شد`);
  };

  const quickStatus = async (s: OrderStatus) => {
    if (!view || view.status === s) return;
    await updateOrder(view.id, { status: s });
    setView({ ...view, status: s });
    toast("success", "وضعیت سفارش تغییر کرد", `وضعیت به «${ORDER_STATUS[s].label}» تغییر یافت`);
  };

  const doDelete = async () => {
    if (!del) return;
    setDelBusy(true);
    await deleteOrder(del.id);
    setDelBusy(false);
    setDel(null);
    if (view?.id === del.id) setView(null);
    toast("success", "سفارش حذف شد", `سفارش ${del.code} حذف شد`);
  };

  const resetFilters = () => {
    setQ("");
    setStatus("all");
    setCid("all");
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <Shell title="مدیریت سفارش‌ها" subtitle={`${faNum(orders.length)} سفارش ثبت شده`}>
      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(49,46,129,0.05)]">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-[2fr_1.2fr_1.4fr_1fr_1fr_auto]">
          <SearchInput
            value={q}
            onChange={(v) => {
              setQ(v);
              setPage(1);
            }}
            placeholder="جستجو بر اساس کد، مشتری یا محصول…"
            className="col-span-2 md:col-span-1"
          />
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="all">همه وضعیت‌ها</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS[s].label}
              </option>
            ))}
          </Select>
          <Select value={cid} onChange={(e) => { setCid(e.target.value); setPage(1); }}>
            <option value="all">همه مشتریان</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            aria-label="از تاریخ"
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(1); }}
            aria-label="تا تاریخ"
          />
          <Button variant="outline" icon={RotateCcw} onClick={resetFilters}>
            پاک کردن
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="mt-5" bodyClass="overflow-x-auto">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : paged.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Package}
              title="سفارشی یافت نشد"
              message="با فیلترهای فعلی سفارشی پیدا نشد. فیلترها را تغییر دهید یا پاک کنید."
              action={
                <Button variant="outline" icon={RotateCcw} onClick={resetFilters}>
                  پاک کردن فیلترها
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-right text-[11px] text-slate-400">
                  <th className="px-5 py-3 font-semibold">شماره سفارش</th>
                  <th className="px-3 py-3 font-semibold">نام مشتری</th>
                  <th className="px-3 py-3 font-semibold">محصول</th>
                  <th className="px-3 py-3 font-semibold">مبلغ</th>
                  <th className="px-3 py-3 font-semibold">وضعیت</th>
                  <th className="px-3 py-3 font-semibold">تاریخ</th>
                  <th className="px-5 py-3 font-semibold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 transition last:border-0 hover:bg-brand-50/40">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-brand-600" dir="ltr">
                        {o.code}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="block font-semibold text-slate-700">
                        {o.customerName}
                      </span>
                      <span className="text-[10px] text-slate-400" dir="ltr">
                        {o.customerPhone}
                      </span>
                    </td>
                    <td className="max-w-[180px] px-3 py-3.5">
                      <span className="block truncate text-xs font-medium text-slate-600">
                        {o.items[0]?.name}
                      </span>
                      {o.items.length > 1 && (
                        <span className="text-[10px] text-slate-400">
                          + {faNum(o.items.length - 1)} مورد دیگر
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 font-bold text-slate-700">
                      {faMoney(o.total)}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-3 py-3.5 text-xs text-slate-400">
                      {faDate(o.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-0.5">
                        <IconBtn icon={Eye} label="مشاهده جزئیات" tone="brand" onClick={() => setView(o)} />
                        <IconBtn icon={Pencil} label="ویرایش" onClick={() => openEdit(o)} />
                        <IconBtn icon={Trash2} label="حذف" tone="danger" onClick={() => setDel(o)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={safePage} pages={pages} onPage={setPage} />
          </>
        )}
      </Card>

      {/* Details modal */}
      <Modal
        open={!!view}
        onClose={() => setView(null)}
        title={view ? `جزئیات سفارش ${view.code}` : ""}
        subtitle={view ? faDateTime(view.date) : ""}
        wide
        footer={
          view && (
            <>
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => {
                  const v = view;
                  setView(null);
                  setDel(v);
                }}
              >
                حذف
              </Button>
              <Button
                variant="primary"
                icon={Pencil}
                onClick={() => {
                  openEdit(view);
                  setView(null);
                }}
              >
                ویرایش سفارش
              </Button>
            </>
          )
        }
      >
        {view && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <User className="h-3 w-3" /> اطلاعات مشتری
                </p>
                <p className="text-sm font-bold text-slate-700">{view.customerName}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <Phone className="h-3 w-3" />
                  <span dir="ltr">{view.customerPhone}</span>
                </p>
                {view.address && (
                  <p className="mt-1 flex items-start gap-1 text-[11px] leading-5 text-slate-500">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                    {view.address}
                  </p>
                )}
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="mb-1 text-[10px] font-bold text-slate-400">تاریخ سفارش</p>
                <p className="text-sm font-bold text-slate-700">{faDate(view.date)}</p>
                <p className="mt-1 text-[11px] text-slate-400">{faDateTime(view.date)}</p>
              </div>
              <div className="rounded-xl bg-gold-100/60 p-3.5 ring-1 ring-gold-300/40">
                <p className="mb-1 text-[10px] font-bold text-gold-600">مبلغ کل سفارش</p>
                <p className="text-base font-black text-indigo-950">{faMoney(view.total)}</p>
                <p className="mt-1 text-[11px] text-gold-600">
                  {faNum(view.items.reduce((s, i) => s + i.qty, 0))} قلم کالا
                </p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold text-slate-500">پیشرفت سفارش</p>
              <StatusStepper status={view.status} />
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-slate-500">
                محصولات سفارش‌داده‌شده
              </p>
              <ul className="divide-y divide-slate-100 rounded-xl ring-1 ring-slate-100">
                {view.items.map((i, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-slate-700">{i.name}</span>
                      <span className="text-[11px] text-slate-400">
                        {faNum(i.qty)} × {faMoney(i.price)}
                      </span>
                    </span>
                    <span className="shrink-0 font-bold text-slate-700">
                      {faMoney(i.qty * i.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {view.notes && (
              <div className="rounded-xl bg-azure-50 px-4 py-3">
                <p className="text-[10px] font-bold text-azure-700">یادداشت‌ها</p>
                <p className="mt-1 text-xs leading-6 text-azure-900">{view.notes}</p>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-bold text-slate-500">تغییر سریع وضعیت</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_ORDER.map((s) => (
                  <button
                    key={s}
                    onClick={() => quickStatus(s)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 ring-inset transition ${
                      view.status === s
                        ? "bg-brand-500 text-white ring-brand-500 shadow-sm"
                        : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {ORDER_STATUS[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title="ویرایش سفارش"
        subtitle={edit ? `کد سفارش: ${edit.code}` : ""}
        footer={
          <>
            <Button variant="outline" onClick={() => setEdit(null)} disabled={editSaving}>
              انصراف
            </Button>
            <Button loading={editSaving} onClick={saveEdit}>
              ذخیره تغییرات
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="وضعیت سفارش">
            <Select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as OrderStatus })}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS[s].label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نام مشتری" required>
              <Input
                value={editForm.customerName}
                onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
              />
            </Field>
            <Field label="شماره تلفن">
              <Input
                dir="ltr"
                value={editForm.customerPhone}
                onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
              />
            </Field>
          </div>
          <Field label="آدرس">
            <Input
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              placeholder="آدرس کامل تحویل"
            />
          </Field>
          <Field label="یادداشت‌ها">
            <Textarea
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              placeholder="یادداشت داخلی درباره سفارش…"
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!del}
        title="حذف سفارش"
        message={`آیا از حذف سفارش ${del?.code ?? ""} مطمئن هستید؟ این عمل قابل بازگشت نیست و موجودی محصولات بازمی‌گردد.`}
        loading={delBusy}
        onConfirm={doDelete}
        onClose={() => setDel(null)}
      />
    </Shell>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <OrdersInner />
    </Suspense>
  );
}
