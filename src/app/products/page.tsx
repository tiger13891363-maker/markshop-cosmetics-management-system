"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Eye, ImagePlus, Pencil, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Shell } from "@/components/Shell";
import { useApp } from "@/store/AppStore";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  IconBtn,
  Input,
  Modal,
  PageSkeleton,
  ProductImage,
  SearchInput,
  Select,
  Skeleton,
  Textarea,
} from "@/components/ui";
import { CATEGORIES } from "@/lib/mock-data";
import type { Product } from "@/lib/types";
import { faMoney, faNum } from "@/lib/format";

interface FormState {
  name: string;
  category: string;
  price: string;
  stock: string;
  image: string;
  status: "active" | "archived";
  description: string;
}
const emptyForm: FormState = {
  name: "",
  category: CATEGORIES[0],
  price: "",
  stock: "",
  image: "",
  status: "active",
  description: "",
};

function ProductsInner() {
  const { loading, products, addProduct, updateProduct, deleteProduct, toast } =
    useApp();
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [st, setSt] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [view, setView] = useState<Product | null>(null);
  const [del, setDel] = useState<Product | null>(null);
  const [delBusy, setDelBusy] = useState(false);

  useEffect(() => {
    const v = params.get("q");
    if (v) setQ(v);
  }, [params]);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (q.trim() && !p.name.includes(q.trim())) return false;
        if (cat !== "all" && p.category !== cat) return false;
        if (st === "active" && p.status !== "active") return false;
        if (st === "archived" && p.status !== "archived") return false;
        if (st === "out" && p.stock !== 0) return false;
        return true;
      }),
    [products, q, cat, st]
  );

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrs({});
    setFormOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      stock: String(p.stock),
      image: p.image,
      status: p.status,
      description: p.description ?? "",
    });
    setErrs({});
    setFormOpen(true);
  };

  const save = async () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = "نام محصول را کامل وارد کنید";
    const price = Number(form.price);
    if (!form.price || isNaN(price) || price <= 0) e.price = "قیمت معتبر وارد کنید";
    const stock = Number(form.stock);
    if (form.stock === "" || isNaN(stock) || stock < 0 || !Number.isInteger(stock))
      e.stock = "موجودی معتبر وارد کنید";
    setErrs(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    const data = {
      name: form.name.trim(),
      category: form.category,
      price,
      stock,
      image: form.image.trim(),
      status: form.status,
      description: form.description.trim() || undefined,
    };
    if (editing) {
      await updateProduct(editing.id, data);
      toast("success", "محصول ویرایش شد", `«${data.name}» با موفقیت به‌روزرسانی شد`);
    } else {
      await addProduct(data);
      toast("success", "محصول اضافه شد", `«${data.name}» به فروشگاه اضافه شد`);
    }
    setSaving(false);
    setFormOpen(false);
  };

  const doDelete = async () => {
    if (!del) return;
    setDelBusy(true);
    await deleteProduct(del.id);
    setDelBusy(false);
    setDel(null);
    if (view?.id === del.id) setView(null);
    toast("success", "محصول حذف شد", `«${del.name}» از فهرست محصولات حذف شد`);
  };

  const stockBar = (p: Product) =>
    p.stock === 0 ? "100%" : `${Math.min(100, (p.stock / 80) * 100)}%`;

  return (
    <Shell
      title="مدیریت محصولات"
      subtitle={`${faNum(products.length)} محصول در فروشگاه`}
      actions={
        <Button icon={Plus} onClick={openAdd} className="hidden sm:inline-flex">
          افزودن محصول
        </Button>
      }
    >
      {/* Toolbar */}
      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(49,46,129,0.05)]">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="جستجوی محصول…"
            className="col-span-2 md:col-span-2"
          />
          <Select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">همه دسته‌بندی‌ها</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select value={st} onChange={(e) => setSt(e.target.value)}>
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="archived">بایگانی شده</option>
            <option value="out">بدون موجودی</option>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={ShoppingBag}
            title="محصولی یافت نشد"
            message="محصولی با این مشخصات پیدا نشد. محصول جدیدی اضافه کنید یا فیلترها را تغییر دهید."
            action={
              <Button icon={Plus} onClick={openAdd}>
                افزودن محصول جدید
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(49,46,129,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(49,46,129,0.25)]"
            >
              <div className="relative">
                <ProductImage
                  src={p.image}
                  alt={p.name}
                  className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                  {p.stock === 0 && (
                    <Badge className="bg-rose-500 text-white ring-rose-600">بدون موجودی</Badge>
                  )}
                  {p.stock > 0 && p.stock < 10 && (
                    <Badge className="bg-gold-400 text-indigo-950 ring-gold-500">موجودی کم</Badge>
                  )}
                  {p.status === "archived" && (
                    <Badge className="bg-slate-700 text-white ring-slate-800">بایگانی</Badge>
                  )}
                </div>
              </div>
              <div className="p-4">
                <Badge className="bg-brand-50 text-brand-600 ring-brand-100">
                  {p.category}
                </Badge>
                <h3 className="mt-2 truncate text-sm font-bold text-slate-800">
                  {p.name}
                </h3>
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {p.stock === 0 ? "ناموجود" : `${faNum(p.stock)} عدد موجود`}
                  </span>
                  <span className="text-sm font-extrabold text-brand-700">
                    {faMoney(p.price)}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${p.stock === 0 ? "bg-rose-400" : p.stock < 10 ? "bg-gold-400" : "bg-gradient-to-l from-brand-500 to-azure-500"}`}
                    style={{ width: p.stock === 0 ? "8%" : stockBar(p) }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-semibold text-slate-400">
                    کد: <span dir="ltr">{p.id.toUpperCase()}</span>
                  </span>
                  <div className="flex items-center gap-0.5">
                    <IconBtn icon={Eye} label="مشاهده محصول" tone="brand" onClick={() => setView(p)} />
                    <IconBtn icon={Pencil} label="ویرایش" onClick={() => openEdit(p)} />
                    <IconBtn icon={Trash2} label="حذف" tone="danger" onClick={() => setDel(p)} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* mobile add button */}
      <div className="mt-5 flex justify-center sm:hidden">
        <Button icon={Plus} size="lg" onClick={openAdd}>
          افزودن محصول جدید
        </Button>
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "ویرایش محصول" : "افزودن محصول جدید"}
        subtitle={editing ? `کد: ${editing.id.toUpperCase()}` : "محصول جدید به فروشگاه اضافه می‌شود"}
        wide
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              انصراف
            </Button>
            <Button loading={saving} icon={ImagePlus} onClick={save}>
              {editing ? "ذخیره تغییرات" : "افزودن محصول"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-600">تصویر محصول</p>
            <ProductImage
              src={form.image}
              alt="پیش‌نمایش"
              className="aspect-square w-full rounded-xl ring-1 ring-slate-200"
            />
          </div>
          <div className="grid content-start gap-4">
            <Field label="نام محصول" required error={errs.name}>
              <Input
                value={form.name}
                error={!!errs.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="مثلاً: کرم مرطوب‌کننده"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="دسته‌بندی">
                <Select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="وضعیت محصول">
                <Select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as "active" | "archived" })
                  }
                >
                  <option value="active">فعال</option>
                  <option value="archived">بایگانی شده</option>
                </Select>
              </Field>
              <Field label="قیمت (تومان)" required error={errs.price}>
                <Input
                  type="number"
                  min={0}
                  value={form.price}
                  error={!!errs.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                />
              </Field>
              <Field label="تعداد موجودی" required error={errs.stock}>
                <Input
                  type="number"
                  min={0}
                  value={form.stock}
                  error={!!errs.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                />
              </Field>
            </div>
            <Field
              label="آدرس تصویر"
              hint="در صورت خالی بودن، تصویر پیش‌فرض نمایش داده می‌شود"
            >
              <Input
                dir="ltr"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </Field>
            <Field label="توضیحات">
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="توضیح کوتاه درباره محصول…"
              />
            </Field>
          </div>
        </div>
      </Modal>

      {/* View modal */}
      <Modal
        open={!!view}
        onClose={() => setView(null)}
        title={view?.name ?? ""}
        subtitle={view ? `کد: ${view.id.toUpperCase()}` : ""}
        footer={
          view && (
            <>
              <Button variant="danger" icon={Trash2} onClick={() => { const v = view; setView(null); setDel(v); }}>
                حذف
              </Button>
              <Button icon={Pencil} onClick={() => { const v = view; setView(null); openEdit(v); }}>
                ویرایش محصول
              </Button>
            </>
          )
        }
      >
        {view && (
          <div>
            <ProductImage
              src={view.image}
              alt={view.name}
              className="h-52 w-full rounded-xl ring-1 ring-slate-100"
              iconSize="h-10 w-10"
            />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge className="bg-brand-50 text-brand-600 ring-brand-100">{view.category}</Badge>
              <Badge
                className={
                  view.status === "active"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-slate-100 text-slate-500 ring-slate-200"
                }
              >
                {view.status === "active" ? "فعال" : "بایگانی شده"}
              </Badge>
              {view.stock === 0 && (
                <Badge className="bg-rose-50 text-rose-700 ring-rose-200">بدون موجودی</Badge>
              )}
            </div>
            {view.description && (
              <p className="mt-3 text-xs leading-6 text-slate-500">{view.description}</p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gold-100/60 p-3.5 ring-1 ring-gold-300/40">
                <p className="text-[10px] font-bold text-gold-600">قیمت</p>
                <p className="mt-1 text-base font-black text-indigo-950">{faMoney(view.price)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="text-[10px] font-bold text-slate-400">موجودی</p>
                <p className="mt-1 text-base font-black text-slate-700">
                  {view.stock === 0 ? "ناموجود" : `${faNum(view.stock)} عدد`}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!del}
        title="حذف محصول"
        message={`آیا از حذف «${del?.name ?? ""}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`}
        loading={delBusy}
        onConfirm={doDelete}
        onClose={() => setDel(null)}
      />
    </Shell>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductsInner />
    </Suspense>
  );
}
