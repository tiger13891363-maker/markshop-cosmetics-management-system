"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string | null;
  image_url: string | null;
  status: string;
};

type ProductForm = {
  name: string;
  price: string;
  stock: string;
  category: string;
  description: string;
  image_url: string;
  status: string;
};

const emptyForm: ProductForm = {
  name: "",
  price: "",
  stock: "",
  category: "سایر",
  description: "",
  image_url: "",
  status: "active",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      alert("خطا در دریافت محصولات: " + error.message);
    } else {
      setProducts((data || []) as Product[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      category: product.category || "سایر",
      description: product.description || "",
      image_url: product.image_url || "",
      status: product.status || "active",
    });

    setShowModal(true);
  }

  function closeModal() {
    if (uploading) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function uploadImage(file: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("لطفاً یک فایل تصویری انتخاب کن.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("حجم عکس نباید بیشتر از ۸ مگابایت باشد.");
      return;
    }

    setUploading(true);

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `product-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${extension}`;

      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      if (!data.publicUrl) {
        throw new Error("آدرس عمومی عکس دریافت نشد.");
      }

      setForm((current) => ({
        ...current,
        image_url: data.publicUrl,
      }));

      alert("عکس با موفقیت آپلود شد ✅");
    } catch (error: any) {
      alert("خطا در آپلود عکس: " + (error?.message || "خطای نامشخص"));
    } finally {
      setUploading(false);
    }
  }

  function handleImageSelect(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (file) {
      uploadImage(file);
    }

    event.target.value = "";
  }

  async function saveProduct() {
    if (!form.name.trim()) {
      alert("نام محصول را وارد کن.");
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!Number.isFinite(price) || price < 0) {
      alert("قیمت محصول صحیح نیست.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      alert("موجودی محصول صحیح نیست.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      price,
      stock,
      category: form.category.trim() || "سایر",
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      status: form.status,
    };

    if (editingId !== null) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId);

      if (error) {
        alert("خطا در ویرایش محصول: " + error.message);
        return;
      }

      alert("محصول با موفقیت ویرایش شد ✅");
    } else {
      const { error } = await supabase
        .from("products")
        .insert(productData);

      if (error) {
        alert("خطا در افزودن محصول: " + error.message);
        return;
      }

      alert("محصول با موفقیت اضافه شد ✅");
    }

    closeModal();
    loadProducts();
  }

  async function deleteProduct(id: number) {
    const ok = confirm(
      "آیا مطمئنی می‌خواهی این محصول را حذف کنی؟"
    );

    if (!ok) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert("خطا در حذف محصول: " + error.message);
      return;
    }

    alert("محصول حذف شد.");
    loadProducts();
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-4 md:p-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              مدیریت محصولات
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              افزودن، ویرایش و مدیریت محصولات مارک‌شاپ
            </p>
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700"
          >
            <Plus size={20} />
            افزودن محصول
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            در حال دریافت محصولات...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow">
            <div className="text-lg font-bold text-slate-700">
              هنوز محصولی ثبت نشده است
            </div>

            <p className="mt-2 text-sm text-slate-500">
              برای شروع روی «افزودن محصول» بزن.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl bg-white shadow-md"
              >
                <div className="relative h-52 bg-slate-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      بدون عکس
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="font-bold text-slate-900">
                    {product.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {product.category}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-indigo-600">
                      {Number(product.price).toLocaleString("fa-IR")} تومان
                    </span>

                    <span className="text-sm text-slate-500">
                      موجودی: {product.stock}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700"
                    >
                      <Pencil size={16} />
                      ویرایش
                    </button>

                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="flex items-center justify-center rounded-lg bg-red-50 px-3 py-2 text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId !== null
                  ? "ویرایش محصول"
                  : "افزودن محصول"}
              </h2>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  نام محصول
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="مثلاً کرم مرطوب‌کننده"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    قیمت
                  </label>

                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    موجودی
                  </label>

                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stock: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  دسته‌بندی
                </label>

                <input
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                  placeholder="مثلاً مراقبت پوست"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  توضیحات
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="توضیحات محصول..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  عکس محصول
                </label>

                {form.image_url && (
                  <div className="mb-3 overflow-hidden rounded-xl border bg-slate-50">
                    <img
                      src={form.image_url}
                      alt="پیش‌نمایش محصول"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-4 py-4 font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
                  >
                    <Upload size={20} />
                    {uploading ? "در حال آپلود..." : "🖼️ انتخاب از گالری"}
                  </button>

                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 px-4 py-4 font-bold text-purple-700 transition hover:bg-purple-100 disabled:opacity-50"
                  >
                    <Upload size={20} />
                    📷 گرفتن عکس با دوربین
                  </button>
                </div>

                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  وضعیت
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
                >
                  <option value="active">فعال</option>
                  <option value="inactive">غیرفعال</option>
                </select>
              </div>

              <button
                onClick={saveProduct}
                disabled={uploading}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {editingId !== null
                  ? "ذخیره تغییرات"
                  : "ثبت محصول"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}0

