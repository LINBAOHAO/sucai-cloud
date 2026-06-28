import type { Locale } from "@/i18n/routing";

type Localized<T> = Record<Locale, T>;

export const homeHero: Localized<{
  badge: string;
  title: string;
  subtitle: string;
  ctaBrowse: string;
  ctaInquiry: string;
}> = {
  zh: {
    badge: "速采云 · Sucai Cloud",
    title: "一站式印尼工业用品采购平台",
    subtitle:
      "专业供应五金、电器、劳保、管材、阀门、轴承等工业用品，支持中国采购、印尼本地配送。",
    ctaBrowse: "浏览产品",
    ctaInquiry: "立即询价",
  },
  en: {
    badge: "Sucai Cloud",
    title: "One-Stop Industrial Procurement for Indonesia",
    subtitle:
      "Hardware, electrical, safety, pipes, valves, bearings and more — sourced from China, delivered locally in Indonesia.",
    ctaBrowse: "Browse Products",
    ctaInquiry: "Get a Quote",
  },
  id: {
    badge: "Sucai Cloud",
    title: "Platform Pengadaan Industri Terpadu untuk Indonesia",
    subtitle:
      "Perkakas, kelistrikan, APD, pipa, valve, bearing, dan lainnya — dari China, dikirim lokal di Indonesia.",
    ctaBrowse: "Lihat Produk",
    ctaInquiry: "Minta Penawaran",
  },
};

export const homeCategories: Localized<{ title: string; subtitle: string }> = {
  zh: { title: "产品分类", subtitle: "覆盖全品类工业用品，点击进入产品中心" },
  en: { title: "Categories", subtitle: "Full-range industrial supplies — browse in our product center" },
  id: { title: "Kategori Produk", subtitle: "Perlengkapan industri lengkap — jelajahi di pusat produk" },
};

export const categoryCards = [
  { id: "hardware-tools", emoji: "🔧" },
  { id: "electrical", emoji: "⚡" },
  { id: "safety", emoji: "🦺" },
  { id: "pipes", emoji: "🚰" },
  { id: "valves", emoji: "🔩" },
  { id: "bearings", emoji: "⚙️" },
  { id: "consumables", emoji: "📦" },
  { id: "logistics", emoji: "🚚" },
] as const;

export const categoryNames: Localized<Record<(typeof categoryCards)[number]["id"], string>> = {
  zh: {
    "hardware-tools": "五金工具",
    electrical: "电气电工",
    safety: "劳保用品",
    pipes: "管材管件",
    valves: "阀门",
    bearings: "轴承",
    consumables: "工业耗材",
    logistics: "仓储物流",
  },
  en: {
    "hardware-tools": "Hardware Tools",
    electrical: "Electrical",
    safety: "Safety Gear",
    pipes: "Pipes & Fittings",
    valves: "Valves",
    bearings: "Bearings",
    consumables: "Consumables",
    logistics: "Warehouse & Logistics",
  },
  id: {
    "hardware-tools": "Perkakas",
    electrical: "Kelistrikan",
    safety: "APD",
    pipes: "Pipa & Fitting",
    valves: "Valve",
    bearings: "Bearing",
    consumables: "Consumables",
    logistics: "Gudang & Logistik",
  },
};

export const homeHotProducts: Localized<{
  title: string;
  subtitle: string;
  brand: string;
  model: string;
  location: string;
  inquiry: string;
  viewAll: string;
}> = {
  zh: {
    title: "热门产品",
    subtitle: "印尼企业采购首选，支持批量询价，快速响应",
    brand: "品牌",
    model: "型号",
    location: "发货地",
    inquiry: "立即询价",
    viewAll: "查看更多产品",
  },
  en: {
    title: "Hot Products",
    subtitle: "Top picks for Indonesian businesses — bulk inquiry supported",
    brand: "Brand",
    model: "Model",
    location: "Ship From",
    inquiry: "Get Quote",
    viewAll: "View All Products",
  },
  id: {
    title: "Produk Populer",
    subtitle: "Pilihan utama bisnis Indonesia — dukung permintaan penawaran massal",
    brand: "Merek",
    model: "Model",
    location: "Asal Pengiriman",
    inquiry: "Minta Penawaran",
    viewAll: "Lihat Semua Produk",
  },
};

export const locationLabels: Localized<Record<string, string>> = {
  zh: {
    shenzhen: "深圳",
    guangzhou: "广州",
    ningbo: "宁波",
    shanghai: "上海",
    yiwu: "义乌",
  },
  en: {
    shenzhen: "Shenzhen",
    guangzhou: "Guangzhou",
    ningbo: "Ningbo",
    shanghai: "Shanghai",
    yiwu: "Yiwu",
  },
  id: {
    shenzhen: "Shenzhen",
    guangzhou: "Guangzhou",
    ningbo: "Ningbo",
    shanghai: "Shanghai",
    yiwu: "Yiwu",
  },
};

export const homeWhyChoose: Localized<{
  title: string;
  subtitle: string;
  items: { title: string; desc: string }[];
}> = {
  zh: {
    title: "为什么选择速采云",
    subtitle: "深耕中印尼工业贸易，打造可信赖的采购生态",
    items: [
      { title: "印尼本地仓储", desc: "雅加达及周边仓储网络，缩短交付周期，降低本地库存压力" },
      { title: "中国供应链整合", desc: "直连中国优质工厂与品牌，品类齐全，价格更具竞争力" },
      { title: "快速报价", desc: "24 小时内响应询价，批量采购专属报价，透明无隐藏费用" },
      { title: "专业采购服务", desc: "一对一采购顾问，覆盖选品、质检、报关、物流全流程" },
    ],
  },
  en: {
    title: "Why Sucai Cloud",
    subtitle: "Trusted China–Indonesia industrial procurement partner",
    items: [
      { title: "Local Warehousing in Indonesia", desc: "Jakarta-area hubs for faster delivery and lower local inventory burden" },
      { title: "Integrated China Supply Chain", desc: "Direct access to verified factories and brands at competitive prices" },
      { title: "Fast Quotation", desc: "Quote within 24 hours with transparent bulk pricing" },
      { title: "Professional Procurement", desc: "Dedicated advisors from sourcing to QC, customs, and logistics" },
    ],
  },
  id: {
    title: "Mengapa Sucai Cloud",
    subtitle: "Mitra pengadaan industri China–Indonesia yang terpercaya",
    items: [
      { title: "Gudang Lokal di Indonesia", desc: "Jaringan gudang di area Jakarta untuk pengiriman lebih cepat" },
      { title: "Integrasi Rantai Pasok China", desc: "Akses langsung ke pabrik dan merek terverifikasi dengan harga kompetitif" },
      { title: "Penawaran Cepat", desc: "Respons penawaran dalam 24 jam dengan harga bulk yang transparan" },
      { title: "Layanan Pengadaan Profesional", desc: "Konsultan dedicated dari sourcing hingga QC, bea cukai, dan logistik" },
    ],
  },
};

export const homeServiceProcess: Localized<{
  title: string;
  subtitle: string;
  steps: string[];
}> = {
  zh: {
    title: "服务流程",
    subtitle: "从需求到交付，全程透明可追踪",
    steps: ["提交需求", "快速报价", "确认订单", "国际运输", "本地配送"],
  },
  en: {
    title: "How It Works",
    subtitle: "Transparent end-to-end procurement process",
    steps: ["Submit Request", "Fast Quote", "Confirm Order", "International Shipping", "Local Delivery"],
  },
  id: {
    title: "Alur Layanan",
    subtitle: "Proses pengadaan transparan dari awal hingga akhir",
    steps: ["Ajukan Kebutuhan", "Penawaran Cepat", "Konfirmasi Pesanan", "Pengiriman Internasional", "Distribusi Lokal"],
  },
};

export const homeContactCta: Localized<{
  title: string;
  subtitle: string;
  button: string;
}> = {
  zh: {
    title: "需要采购工业用品？",
    subtitle: "告诉我们您的需求，专业团队将在 24 小时内与您联系",
    button: "立即联系我们",
  },
  en: {
    title: "Need Industrial Supplies?",
    subtitle: "Tell us your requirements — our team will reach out within 24 hours",
    button: "Contact Us Now",
  },
  id: {
    title: "Butuh Perlengkapan Industri?",
    subtitle: "Ceritakan kebutuhan Anda — tim kami akan menghubungi dalam 24 jam",
    button: "Hubungi Kami",
  },
};

export const productNames: Localized<Record<string, string>> = {
  zh: {
    p1: "工业级角磨机",
    p2: "专业级角磨机",
    p3: "马达保护断路器",
    p4: "空气开关 C32",
    p5: "防砸防穿刺劳保鞋",
    p6: "安全帽",
    p7: "304 不锈钢无缝管",
    p8: "PVC-U 给水管",
  },
  en: {
    p1: "Industrial Angle Grinder",
    p2: "Professional Angle Grinder",
    p3: "Motor Protection Breaker",
    p4: "Miniature Circuit Breaker C32",
    p5: "Safety Shoes",
    p6: "Safety Helmet",
    p7: "304 Stainless Steel Pipe",
    p8: "PVC-U Water Pipe",
  },
  id: {
    p1: "Gerinda Sudut Industri",
    p2: "Gerinda Sudut Profesional",
    p3: "Pemutus Motor",
    p4: "MCB C32",
    p5: "Sepatu Safety",
    p6: "Helm Safety",
    p7: "Pipa SS 304",
    p8: "Pipa PVC-U",
  },
};
