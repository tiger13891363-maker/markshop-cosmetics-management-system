import type {
  Customer,
  Order,
  OrderStatus,
  Product,
  Settings,
} from "./types";

// ─────────────────────────────────────────────────────────────
// Mock seed data.
// Dates are generated relative to "now" so the dashboard always
// shows a live, believable state. Replace this module's exports
// with real API calls when a backend is connected.
// ─────────────────────────────────────────────────────────────

const img = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=480&w=480`;

const daysAgo = (d: number, h = 10, m = 24) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(h, m, 0, 0);
  return t.toISOString();
};

export const CATEGORIES = [
  "آرایشی",
  "مراقبت پوست",
  "مراقبت مو",
  "عطر و خوشبو",
  "بهداشت شخصی",
];

export const seedProducts: Product[] = [
  { id: "p1", name: "رژ لب مات مخملی", category: "آرایشی", price: 485000, stock: 34, image: img(6527700), status: "active", description: "رژ لب با فرمولاسیون مخملی، ماندگاری بالا و پوشش کامل در ۱۲ رنگ." },
  { id: "p2", name: "کرم ضد آفتاب SPF50", category: "مراقبت پوست", price: 720000, stock: 8, image: img(24602077), status: "active", description: "محافظت قوی UVB و UVA بدون چرب شدن، مناسب انواع پوست." },
  { id: "p3", name: "کرم مرطوب‌کننده بابونه", category: "مراقبت پوست", price: 560000, stock: 45, image: img(35976902), status: "active", description: "ترکیب مرطوب‌کننده با عصاره بابونه، آرام‌بخش پوست‌های حساس." },
  { id: "p4", name: "شامپو کراتین ترمیم‌کننده", category: "مراقبت مو", price: 380000, stock: 60, image: img(7546589), status: "active", description: "ترمیم موهای آسیب‌دیده با کراتین طبیعی و روغن آرگان." },
  { id: "p5", name: "عطر رقیب", category: "عطر و خوشبو", price: 2450000, stock: 15, image: img(16722501), status: "active", description: "عطر شرقی-میوه‌ای با ماندگاری بالا؛ عطر اختصاصی مارک‌شاپ." },
  { id: "p6", name: "سرم ویتامین C", category: "مراقبت پوست", price: 890000, stock: 7, image: img(24602077), status: "active", description: "سرم روشن‌کننده با ۱۵٪ ویتامین C خالص برای پوست درخشان." },
  { id: "p7", name: "تونر گل رز", category: "مراقبت پوست", price: 410000, stock: 27, image: img(24602072), status: "active", description: "تونر ملایم با آب گلاب برای تعادل pH پوست." },
  { id: "p8", name: "پالت سایه ۵ رنگه", category: "آرایشی", price: 640000, stock: 0, image: img(29877733), status: "active", description: "پالت سایه بافت ساتن، سایه‌های گرم و سرد برای هر مناسبت." },
  { id: "p9", name: "روغن عطر رز", category: "عطر و خوشبو", price: 1150000, stock: 22, image: img(16722498), status: "active", description: "روغن عطر رز دماوند، بدون الکل و مناسب حساسیت." },
  { id: "p10", name: "پرفیوم یاس سفید", category: "عطر و خوشبو", price: 3200000, stock: 6, image: img(16125025), status: "active", description: "پرفیوم لوکس با نت‌های یاس، ونیل و چوب صندل." },
  { id: "p11", name: "دهودورانت بدون آلومینیوم", category: "بهداشت شخصی", price: 295000, stock: 78, image: img(7546589), status: "active", description: "محافظت ۴۸ ساعته، بدون آلومینیوم و با عطر ملایم." },
  { id: "p12", name: "ژل شستشوی صورت", category: "بهداشت شخصی", price: 350000, stock: 41, image: img(24602072), status: "active", description: "پاک‌کننده عمیق بدون ایجاد خشکی، مناسب پوست مختلط." },
  { id: "p13", name: "ماسک صورت طلایی", category: "مراقبت پوست", price: 520000, stock: 18, image: img(35976902), status: "active", description: "ماسک ورقه‌ای با ذرات طلایی برای درخشش فوری پوست." },
  { id: "p14", name: "کرم دور چشم پپتیدی", category: "مراقبت پوست", price: 760000, stock: 4, image: img(35976902), status: "archived", description: "کاهش تیرگی و خطوط ریز با پپتیدهای جوان‌کننده." },
];

export const seedCustomers: Customer[] = [
  { id: "c1", name: "سارا محمدی", phone: "09121456789", registrationDate: daysAgo(214), status: "active" },
  { id: "c2", name: "مریم حسینی", phone: "09352211443", registrationDate: daysAgo(182), status: "active", notes: "سفارش‌دهنده منظم؛ ترجیح ارسال عصر" },
  { id: "c3", name: "نگار احمدی", phone: "09198765432", registrationDate: daysAgo(151), status: "active" },
  { id: "c4", name: "لیلا موسوی", phone: "09301122334", registrationDate: daysAgo(120), status: "active" },
  { id: "c5", name: "فاطمه نادری", phone: "09129988776", registrationDate: daysAgo(98), status: "active" },
  { id: "c6", name: "الهام رستمی", phone: "09365544332", registrationDate: daysAgo(76), status: "active" },
  { id: "c7", name: "پریسا علوی", phone: "09172233445", registrationDate: daysAgo(54), status: "active" },
  { id: "c8", name: "مینا قاسمی", phone: "09387766554", registrationDate: daysAgo(41), status: "inactive", notes: "سه ماه بدون سفارش" },
  { id: "c9", name: "شیرین کاظمی", phone: "09153344556", registrationDate: daysAgo(28), status: "active" },
  { id: "c10", name: "نیلوفر صادقی", phone: "09214455667", registrationDate: daysAgo(17), status: "active" },
  { id: "c11", name: "الناز رحیمی", phone: "09391122558", registrationDate: daysAgo(8), status: "active" },
  { id: "c12", name: "هانیه فرهادی", phone: "09168877990", registrationDate: daysAgo(2), status: "active" },
];

const PM: Record<string, Product> = Object.fromEntries(
  seedProducts.map((p) => [p.id, p])
);
const CM: Record<string, Customer> = Object.fromEntries(
  seedCustomers.map((c) => [c.id, c])
);

const mk = (
  id: string,
  code: string,
  cid: string,
  day: number,
  status: OrderStatus,
  items: [string, number][],
  extra: Partial<Order> = {}
): Order => {
  const it = items.map(([pid, qty]) => ({
    productId: pid,
    name: PM[pid].name,
    qty,
    price: PM[pid].price,
  }));
  const c = CM[cid];
  return {
    id,
    code,
    customerId: cid,
    customerName: c.name,
    customerPhone: c.phone,
    items: it,
    total: it.reduce((s, i) => s + i.qty * i.price, 0),
    status,
    date: daysAgo(day, 9 + (day % 9), 10 + (day % 45)),
    ...extra,
  };
};

export const seedOrders: Order[] = [
  mk("o1", "MS-1062", "c1", 0, "new", [["p1", 2], ["p12", 1]], { notes: "لطفاً رنگ ۳۰۱ باشد", address: "تهران، سعادت‌آباد، بلوار دریا" }),
  mk("o2", "MS-1061", "c11", 0, "new", [["p3", 1]]),
  mk("o3", "MS-1060", "c7", 0, "new", [["p11", 2]]),
  mk("o4", "MS-1059", "c4", 0, "processing", [["p6", 1]], { address: "کرج، خیابان گلستان، کوچه بهار" }),
  mk("o5", "MS-1058", "c2", 1, "ready", [["p5", 1]], { notes: "بسته‌بندی هدیه" }),
  mk("o6", "MS-1057", "c3", 1, "completed", [["p2", 1], ["p3", 1]]),
  mk("o7", "MS-1056", "c5", 2, "shipped", [["p10", 1]], { notes: "ارسال پیک ویژه" }),
  mk("o8", "MS-1055", "c1", 2, "completed", [["p4", 2]]),
  mk("o9", "MS-1054", "c9", 4, "completed", [["p1", 1], ["p13", 1]]),
  mk("o10", "MS-1053", "c8", 5, "cancelled", [["p8", 1]], { notes: "لغو به دلیل اتمام موجودی" }),
  mk("o11", "MS-1052", "c6", 7, "shipped", [["p7", 2], ["p13", 1]]),
  mk("o12", "MS-1051", "c2", 9, "completed", [["p14", 1]]),
  mk("o13", "MS-1050", "c10", 12, "ready", [["p3", 1], ["p6", 2]]),
  mk("o14", "MS-1049", "c11", 15, "processing", [["p1", 3]]),
  mk("o15", "MS-1048", "c4", 18, "completed", [["p9", 1]]),
  mk("o16", "MS-1047", "c12", 22, "shipped", [["p2", 2]]),
  mk("o17", "MS-1046", "c3", 26, "completed", [["p11", 3], ["p12", 1]]),
  mk("o18", "MS-1045", "c5", 31, "completed", [["p4", 1]]),
  mk("o19", "MS-1044", "c7", 34, "completed", [["p13", 2]]),
];

/** Business-wide 180-day sales series (mock, deterministic). */
export const salesHistory: number[] = (() => {
  let s = 7;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: 180 }, (_, i) => {
    const base = 4.2e6 + i * 1.5e4;
    const wave = 1.1e6 * Math.sin(i / 9) + 6e5 * Math.sin(i / 23);
    return Math.round((base + wave * 0.45 + rnd() * 1.1e6) / 1e4) * 1e4;
  });
})();

/** Orders per month for the last 6 months (mock). */
export const monthlyOrders = [96, 104, 118, 126, 141, 155];
export const totalOrdersAll = monthlyOrders.reduce((a, b) => a + b, 0);

/** Cumulative registered customers per month (mock). */
export const customerGrowth = [42, 55, 63, 74, 88, 102];

export const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; badge: string; dot: string }
> = {
  new: { label: "جدید", badge: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-500" },
  processing: { label: "در حال بررسی", badge: "bg-violet-50 text-violet-700 ring-violet-200", dot: "bg-violet-500" },
  ready: { label: "آماده ارسال", badge: "bg-indigo-50 text-indigo-700 ring-indigo-200", dot: "bg-indigo-500" },
  shipped: { label: "ارسال شده", badge: "bg-cyan-50 text-cyan-700 ring-cyan-200", dot: "bg-cyan-500" },
  completed: { label: "تکمیل شده", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  cancelled: { label: "لغو شده", badge: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
};

export const STATUS_ORDER: OrderStatus[] = [
  "new",
  "processing",
  "ready",
  "shipped",
  "completed",
  "cancelled",
];

export const defaultSettings: Settings = {
  shopName: "مارک‌شاپ",
  tagline: "فروشگاه آنلاین محصولات آرایشی و بهداشتی",
  phone: "021-88776655",
  address: "تهران، خیابان ولیعصر، مرکز خرید آریا، واحد ۱۲",
  logo: "",
  adminName: "سارا محمدی",
  adminEmail: "admin@markshop.ir",
  adminPhone: "09121456789",
  notNewOrder: true,
  notLowStock: true,
  notDailySummary: false,
  accent: "classic",
  goldAccent: true,
  restUrl: "",
  restToken: "",
  dbUrl: "",
  dbUser: "",
  dbPass: "",
  mixUrl: "",
  mixToken: "",
};
