"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, Pencil, Plus, Trash2, Users } from "lucide-react";
import { Shell } from "@/components/Shell";
import { useApp } from "@/store/AppStore";
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  IconBtn,
  Input,
  Modal,
  PageSkeleton,
  SearchInput,
  Select,
  Skeleton,
  StatusBadge,
  Textarea,
} from "@/components/ui";
import type { Customer, Order } from "@/lib/types";
import { faDate, faMoney, faNum } from "@/lib/format";

interface CForm {
  name: string;
  phone: string;
  status: "active" | "inactive";
  notes: string;
}
const emptyC: CForm = { name: "", phone: "", status: "active", notes: "" };

function CustomersInner() {
  const {
    loading,
    customers,
    orders,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    toast,
  } = useApp();
  const params = useSearchParams();

  const [q, setQ] = useState("");
  const [st, setSt] = useState("all");
  const [sort, setSort] = useState("newest");

  const [view, setView] = useState<Customer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<CForm>(emptyC);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState<Customer | null>(null);
  const [delBusy, setDelBusy] = useState(false);

  useEffect(() => {
    const v = params.get("q");
    if (v) setQ(v);
  }, [params]);

  const stats = useMemo(() => {
    const m: Record<string, { count: number; total: number; last?: Order }> = {};
    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const s = (m[o.customerId] ??= { count: 0, total: 0 });
      s.count++;
      s.total += o.total;
      if (!s.last || o.date > s.last.date) s.last = o;
    });
    return m;
  }, [orders]);

  const filtered = useMemo(() => {
    const s = q.trim();
    const list = customers.filter((c) => {
      if (s && !c.name.includes(s) && !c.phone.includes(s)) return false;
      if (st !== "all" && c.status !== st) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === "newest") return b.registrationDate.localeCompare(a.registrationDate);
      if (sort === "oldest") return a.registrationDate.localeCompare(b.registrationDate);
      return (stats[b.id]?.total ?? 0) - (stats[a.id]?.total ?? 0);
    });
  }, [customers, q, st, sort, stats]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyC);
    setErrs({});
    setFormOpen(true);
  };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      name: c.name,
      phone: c.phone,
      status: c.status,
      notes: c.notes ?? "",
    });
    setErrs({});
    setFormOpen(true);
  };

  const save = async () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = "نام و نام خانوادگی را کامل وارد کنید";
    if (!/^09\d{9}$/.test(form.phone.trim()))
      e.phone = "شماره تلفن معتبر نیست (مثال: 09121234567)";
    setErrs(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    const data = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      status: form.status,
      notes: form.notes.trim() || undefined,
    };
    if (editing) {
      await updateCustomer(editing.id, data);
      toast("success", "مشتری ویرایش شد", `اطلاعات «${data.name}» به‌روزرسانی شد`);
    } else {
      await addCustomer(data);
      toast("success", "مشتری اضافه شد", `«${data.name}» به فهرست مشتریان اضافه شد`);
    }
    setSaving(false);
    setFormOpen(false);
  };

  const doDelete = async () => {
    if (!del) return;
    setDelBusy(true);
    await deleteCustomer(del.id);
    setDelBusy(false);
    setDel(null);
    if (view?.id === del.id) setView(null);
    toast("success", "مشتری حذف شد", `«${del.name}» از فهرست مشتریان حذف شد`);
  };

  const viewOrders = view
    ? orders
        .filter((o) => o.customerId === view.id)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return (
    <Shell
      title="مدیریت مشتریان"
      subtitle={`${faNum(customers.length)} مشتری فعال و غیرفعال`}
      actions={
        <Button icon={Plus} onClick={openAdd} className="hidden sm:inline-flex">
          افزودن مشتری
        </Button>
      }
    >
      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(49,46,129,0.05)]">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="جستجو بر اساس نام یا تلفن…"
            className="col-span-2"
          />
          <Select value={st} onChange={(e) => setSt(e.target.value)}>
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">جدیدترین عضویت</option>
            <option value="oldest">قدیمی‌ترین عضویت</option>
            <option value="spend">بیشترین خرید</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <section className="mt-5 overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(49,46,129,0.05)]">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Users}
              title="مشتری‌ای یافت نشد"
              message="با این فیلترها مشتری پیدا نشد. مشتری جدیدی اضافه کنید یا فیلترها را تغییر دهید."
              action={
                <Button icon={Plus} onClick={openAdd}>
                  افزودن مشتری
                </Button>
              }
            />
          </div>
        ) : (
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-right text-[11px] text-slate-400">
                <th className="px-5 py-3 font-semibold">نام مشتری</th>
                <th className="px-3 py-3 font-semibold">شماره تلفن</th>
                <th className="px-3 py-3 font-semibold">تعداد سفارش‌ها</th>
                <th className="px-3 py-3 font-semibold">مجموع خرید</th>
                <th className="px-3 py-3 font-semibold">تاریخ ثبت‌نام</th>
                <th className="px-3 py-3 font-semibold">وضعیت مشتری</th>
                <th className="px-5 py-3 font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const s = stats[c.id];
                return (
                  <tr key={c.id} className="border-b border-slate-50 transition last:border-0 hover:bg-brand-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} size="sm" />
                        <div>
                          <p className="font-bold text-slate-700">{c.name}</p>
                          {s?.last && (
                            <p className="text-[10px] text-slate-400">
                              آخرین سفارش: {faDate(s.last.date)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500" dir="ltr">
                      {c.phone}
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                        {faNum(s?.count ?? 0)}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-700">
                      {faMoney(s?.total ?? 0)}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-400">
                      {faDate(c.registrationDate)}
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        className={
                          c.status === "active"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-slate-100 text-slate-500 ring-slate-200"
                        }
                      >
                        {c.status === "active" ? "فعال" : "غیرفعال"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-0.5">
                        <IconBtn icon={Eye} label="مشاهده جزئیات" tone="brand" onClick={() => setView(c)} />
                        <IconBtn icon={Pencil} label="ویرایش" onClick={() => openEdit(c)} />
                        <IconBtn icon={Trash2} label="حذف" tone="danger" onClick={() => setDel(c)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <div className="mt-5 flex justify-center sm:hidden">
        <Button icon={Plus} size="lg" onClick={openAdd}>
          افزودن مشتری
        </Button>
      </div>

      {/* Details modal */}
      <Modal
        open={!!view}
        onClose={() => setView(null)}
        title="جزئیات مشتری"
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
                icon={Pencil}
                onClick={() => {
                  const v = view;
                  setView(null);
                  openEdit(v);
                }}
              >
                ویرایش مشتری
              </Button>
            </>
          )
        }
      >
        {view && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={view.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-base font-black text-slate-800">{view.name}</p>
                <p className="mt-0.5 text-xs text-slate-400" dir="ltr">
                  {view.phone}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  عضویت از {faDate(view.registrationDate)}
                </p>
              </div>
              <Badge
                className={
                  view.status === "active"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-slate-100 text-slate-500 ring-slate-200"
                }
              >
                {view.status === "active" ? "فعال" : "غیرفعال"}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 p-3.5 text-center">
                <p className="text-lg font-black text-brand-600">
                  {faNum(stats[view.id]?.count ?? 0)}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                  تعداد سفارش‌ها
                </p>
              </div>
              <div className="rounded-xl bg-gold-100/60 p-3.5 text-center ring-1 ring-gold-300/40">
                <p className="text-sm font-black text-indigo-950 leading-6">
                  {faMoney(stats[view.id]?.total ?? 0)}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-gold-600">
                  مجموع خرید
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 text-center">
                <p className="text-xs font-black text-slate-700 leading-7">
                  {stats[view.id]?.last ? faDate(stats[view.id].last!.date) : "—"}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-400">
                  آخرین سفارش
                </p>
              </div>
            </div>

            {view.notes && (
              <div className="rounded-xl bg-azure-50 px-4 py-3">
                <p className="text-[10px] font-bold text-azure-700">یادداشت</p>
                <p className="mt-1 text-xs leading-6 text-azure-900">{view.notes}</p>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-bold text-slate-500">
                تاریخچه سفارش‌ها ({faNum(viewOrders.length)})
              </p>
              {viewOrders.length === 0 ? (
                <p className="rounded-xl border-2 border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                  این مشتری هنوز سفارشی ثبت نکرده است
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 rounded-xl ring-1 ring-slate-100">
                  {viewOrders.slice(0, 6).map((o) => (
                    <li key={o.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="rounded-md bg-brand-50 px-2 py-1 text-[10px] font-black text-brand-600" dir="ltr">
                        {o.code}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-slate-600">
                          {o.items[0]?.name}
                          {o.items.length > 1 && ` + ${faNum(o.items.length - 1)}`}
                        </span>
                        <span className="text-[10px] text-slate-400">{faDate(o.date)}</span>
                      </span>
                      <span className="text-xs font-bold text-slate-700">{faMoney(o.total)}</span>
                      <StatusBadge status={o.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "ویرایش مشتری" : "افزودن مشتری جدید"}
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              انصراف
            </Button>
            <Button loading={saving} onClick={save}>
              {editing ? "ذخیره تغییرات" : "افزودن مشتری"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="نام و نام خانوادگی" required error={errs.name}>
            <Input
              value={form.name}
              error={!!errs.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثلاً: سارا محمدی"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="شماره تلفن" required error={errs.phone}>
              <Input
                dir="ltr"
                value={form.phone}
                error={!!errs.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="09121234567"
              />
            </Field>
            <Field label="وضعیت مشتری">
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as "active" | "inactive" })
                }
              >
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
              </Select>
            </Field>
          </div>
          <Field label="یادداشت">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="توضیحات داخلی درباره مشتری…"
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!del}
        title="حذف مشتری"
        message={`آیا از حذف «${del?.name ?? ""}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`}
        loading={delBusy}
        onConfirm={doDelete}
        onClose={() => setDel(null)}
      />
    </Shell>
  );
}

export default function CustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <PageSkeleton />
        </div>
      }
    >
      <CustomersInner />
    </Suspense>
  );
}
