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
      "五金、电器、劳保、管材、阀门、轴承等工业用品采购服务，支持中国供应链 + 印尼本地配送。",
    ctaBrowse: "浏览产品",
    ctaInquiry: "立即询价",
  },
  en: {
    badge: "Sucai Cloud · B2B Industrial",
    title: "One-Stop Industrial Procurement for Indonesia",
    subtitle:
      "Hardware, electrical, safety, pipes, valves, bearings and more — China supply chain integrated with local delivery across Indonesia.",
    ctaBrowse: "Browse Products",
    ctaInquiry: "Get a Quote",
  },
  id: {
    badge: "Sucai Cloud · B2B Industri",
    title: "Platform Pengadaan Industri Terpadu untuk Indonesia",
    subtitle:
      "Perkakas, kelistrikan, APD, pipa, valve, bearing, dan lainnya — rantai pasok China terintegrasi dengan distribusi lokal di Indonesia.",
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
  { id: "hardware-tools", icon: "Wrench" },
  { id: "electrical", icon: "Zap" },
  { id: "safety", icon: "HardHat" },
  { id: "pipes", icon: "Cylinder" },
  { id: "valves", icon: "Settings2" },
  { id: "bearings", icon: "CircleDot" },
  { id: "consumables", icon: "Boxes" },
  { id: "logistics", icon: "Warehouse" },
] as const;

export const categoryDescriptions: Localized<
  Record<(typeof categoryCards)[number]["id"], string>
> = {
  zh: {
    "hardware-tools": "手动工具、电动工具、测量工具",
    electrical: "电气元件、开关、线缆、配电",
    safety: "安全防护、个人防护装备",
    pipes: "管道、接头、法兰、软管",
    valves: "球阀、闸阀、蝶阀、止回阀",
    bearings: "滚动轴承、滑动轴承、联轴器",
    consumables: "切削液、润滑脂、砂轮、焊材",
    logistics: "货架、托盘、搬运设备、包装",
  },
  en: {
    "hardware-tools": "Hand tools, power tools, measuring instruments",
    electrical: "Components, switches, cables, power distribution",
    safety: "Safety protection and personal protective equipment",
    pipes: "Pipes, fittings, flanges, and hoses",
    valves: "Ball, gate, butterfly, and check valves",
    bearings: "Rolling bearings, plain bearings, couplings",
    consumables: "Cutting fluid, grease, grinding wheels, welding",
    logistics: "Racking, pallets, handling equipment, packaging",
  },
  id: {
    "hardware-tools": "Perkakas tangan, listrik, alat ukur",
    electrical: "Komponen, saklar, kabel, distribusi listrik",
    safety: "Perlindungan keselamatan dan APD",
    pipes: "Pipa, fitting, flange, dan selang",
    valves: "Ball valve, gate valve, butterfly, check valve",
    bearings: "Bearing gelinding, bearing datar, kopling",
    consumables: "Cairan potong, grease, batu gerinda, las",
    logistics: "Rak, palet, peralatan handling, kemasan",
  },
};

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
  status: string;
  statusInStock: string;
  statusPreOrder: string;
  viewDetail: string;
  inquiry: string;
  viewAll: string;
}> = {
  zh: {
    title: "热门产品",
    subtitle: "精选印尼工业采购热门产品",
    brand: "品牌",
    model: "型号",
    location: "发货地",
    status: "状态",
    statusInStock: "现货",
    statusPreOrder: "可订货",
    viewDetail: "查看详情",
    inquiry: "立即询价",
    viewAll: "查看更多产品",
  },
  en: {
    title: "Hot Products",
    subtitle: "Featured industrial products for Indonesian procurement",
    brand: "Brand",
    model: "Model",
    location: "Ship From",
    status: "Status",
    statusInStock: "In Stock",
    statusPreOrder: "Pre-order",
    viewDetail: "View Details",
    inquiry: "Get Quote",
    viewAll: "View All Products",
  },
  id: {
    title: "Produk Populer",
    subtitle: "Produk industri pilihan untuk pengadaan Indonesia",
    brand: "Merek",
    model: "Model",
    location: "Asal Pengiriman",
    status: "Status",
    statusInStock: "Stok Tersedia",
    statusPreOrder: "Pre-order",
    viewDetail: "Lihat Detail",
    inquiry: "Minta Penawaran",
    viewAll: "Lihat Semua Produk",
  },
};

export type HomeFeaturedProduct = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  shipFrom: keyof typeof indonesiaShipLocations;
  status: "inStock" | "preOrder";
};

export const indonesiaShipLocations = {
  jakarta: { zh: "Jakarta", en: "Jakarta", id: "Jakarta" },
  surabaya: { zh: "Surabaya", en: "Surabaya", id: "Surabaya" },
  medan: { zh: "Medan", en: "Medan", id: "Medan" },
  semarang: { zh: "Semarang", en: "Semarang", id: "Semarang" },
  bandung: { zh: "Bandung", en: "Bandung", id: "Bandung" },
} as const;

/** Homepage featured products — slugs match mock-products.ts */
export const homeFeaturedProducts: HomeFeaturedProduct[] = [
  { id: "hf1", slug: "skf-6205-2rs", brand: "SKF", model: "6205-2RS", shipFrom: "jakarta", status: "inStock" },
  { id: "hf2", slug: "bosch-gws-750-100", brand: "Bosch", model: "GWS 750-100", shipFrom: "surabaya", status: "inStock" },
  { id: "hf3", slug: "makita-h910-pro", brand: "Makita", model: "H910 Pro", shipFrom: "jakarta", status: "preOrder" },
  { id: "hf4", slug: "abb-gate-valve-dn80", brand: "ABB", model: "Z41H-16C DN80", shipFrom: "semarang", status: "inStock" },
  { id: "hf5", slug: "schneider-pvc-u-dn32", brand: "Schneider", model: "PVC-U DN32", shipFrom: "surabaya", status: "inStock" },
  { id: "hf6", slug: "bosch-safety-shoes-gb21148", brand: "Bosch", model: "GB21148-2020", shipFrom: "jakarta", status: "inStock" },
  { id: "hf7", slug: "makita-9557nb", brand: "Makita", model: "9557NB", shipFrom: "medan", status: "inStock" },
  { id: "hf8", slug: "schneider-lc1d09m7c", brand: "Schneider", model: "LC1D09M7C", shipFrom: "bandung", status: "inStock" },
];

export const homeFeaturedProductNames: Localized<Record<string, string>> = {
  zh: {
    hf1: "深沟球轴承 6205",
    hf2: "工业级角磨机",
    hf3: "安全帽",
    hf4: "铸钢闸阀 DN80",
    hf5: "PVC-U 给水管",
    hf6: "防砸防穿刺劳保鞋",
    hf7: "专业级角磨机",
    hf8: "马达保护断路器",
  },
  en: {
    hf1: "SKF Deep Groove Ball Bearing 6205-2RS",
    hf2: "Industrial Angle Grinder",
    hf3: "Safety Helmet",
    hf4: "Cast Steel Gate Valve DN80",
    hf5: "PVC-U Water Pipe",
    hf6: "Safety Shoes",
    hf7: "Professional Angle Grinder",
    hf8: "Motor Protection Breaker",
  },
  id: {
    hf1: "SKF Bearing Alur Dalam 6205-2RS",
    hf2: "Gerinda Sudut Industri",
    hf3: "Helm Safety",
    hf4: "Katup Gerbang Baja DN80",
    hf5: "Pipa PVC-U",
    hf6: "Sepatu Safety",
    hf7: "Gerinda Sudut Profesional",
    hf8: "Pemutus Motor",
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
    title: "为什么选择速采云？",
    subtitle: "专注中国供应链与印尼本地采购，为企业提供高效、可靠的工业用品采购服务。",
    items: [
      { title: "印尼本地仓储", desc: "印尼本地备货与配送，缩短交货周期。" },
      { title: "中国供应链整合", desc: "整合中国优质工业品牌，提供更多选择。" },
      { title: "快速报价", desc: "24 小时内响应采购需求，快速提供报价方案。" },
      { title: "专业采购团队", desc: "熟悉中印尼市场，提供采购、物流、售后一站式服务。" },
    ],
  },
  en: {
    title: "Why Sucai Cloud?",
    subtitle: "Focused on China supply chains and local Indonesia sourcing for efficient, reliable industrial procurement.",
    items: [
      { title: "Local Warehousing in Indonesia", desc: "Local stock and delivery in Indonesia to shorten lead times." },
      { title: "Integrated China Supply Chain", desc: "Curated Chinese industrial brands for more product options." },
      { title: "Fast Quotation", desc: "Respond to procurement requests within 24 hours with quick quotes." },
      { title: "Professional Procurement Team", desc: "Experts in China–Indonesia markets offering end-to-end sourcing, logistics, and after-sales support." },
    ],
  },
  id: {
    title: "Mengapa Sucai Cloud?",
    subtitle: "Fokus pada rantai pasok China dan pengadaan lokal Indonesia untuk layanan pengadaan industri yang efisien dan andal.",
    items: [
      { title: "Gudang Lokal di Indonesia", desc: "Stok dan pengiriman lokal di Indonesia untuk memperpendek waktu pengiriman." },
      { title: "Integrasi Rantai Pasok China", desc: "Mengintegrasikan merek industri China berkualitas untuk lebih banyak pilihan." },
      { title: "Penawaran Cepat", desc: "Merespons kebutuhan pengadaan dalam 24 jam dengan penawaran cepat." },
      { title: "Tim Pengadaan Profesional", desc: "Menguasai pasar China–Indonesia, menyediakan layanan pengadaan, logistik, dan purna jual terpadu." },
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

export const homeTrustedBrands: Localized<{
  title: string;
  subtitle: string;
  stats: { value: string; label: string }[];
}> = {
  zh: {
    title: "合作品牌",
    subtitle: "我们与全球知名工业品牌合作，为客户提供可靠的工业用品采购服务。",
    stats: [
      { value: "5000+", label: "工业产品" },
      { value: "300+", label: "合作企业" },
      { value: "20+", label: "品牌合作" },
      { value: "24h", label: "快速报价" },
    ],
  },
  en: {
    title: "Trusted Brands",
    subtitle: "We partner with globally recognized industrial brands to deliver reliable procurement services.",
    stats: [
      { value: "5000+", label: "Industrial Products" },
      { value: "300+", label: "Partner Companies" },
      { value: "20+", label: "Brand Partners" },
      { value: "24h", label: "Fast Quotation" },
    ],
  },
  id: {
    title: "Merek Terpercaya",
    subtitle: "Kami bekerja sama dengan merek industri global terkemuka untuk layanan pengadaan yang andal.",
    stats: [
      { value: "5000+", label: "Produk Industri" },
      { value: "300+", label: "Perusahaan Mitra" },
      { value: "20+", label: "Mitra Merek" },
      { value: "24h", label: "Penawaran Cepat" },
    ],
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
