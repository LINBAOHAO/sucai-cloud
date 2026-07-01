import { mockProducts } from "@/lib/mock-products";
import type { AdminBrand, AdminCategory, AdminProduct, AdminSettings } from "@/lib/admin/types";

const defaultCategorySeeds = [
  { id: "hardware-tools", icon: "Wrench" },
  { id: "electrical", icon: "Zap" },
  { id: "safety", icon: "HardHat" },
  { id: "pipes", icon: "Cylinder" },
  { id: "valves", icon: "Settings2" },
  { id: "bearings", icon: "CircleDot" },
  { id: "consumables", icon: "Boxes" },
  { id: "logistics", icon: "Warehouse" },
] as const;

const productNames: Record<string, string> = {
  p1: "工业级角磨机",
  p2: "专业级角磨机",
  p3: "马达保护断路器",
  p4: "空气开关 C32",
  p5: "防砸防穿刺劳保鞋",
  p6: "安全帽",
  p7: "304 不锈钢无缝管",
  p8: "PVC-U 给水管",
  p9: "铸钢闸阀 DN80",
  p10: "深沟球轴承 6205",
  p11: "工业润滑脂",
  p12: "工业工具箱",
};

const categoryNameMap: Record<string, string> = {
  "hardware-tools": "五金工具",
  electrical: "电气电工",
  safety: "劳保用品",
  pipes: "管材管件",
  valves: "阀门",
  bearings: "轴承",
  consumables: "工业耗材",
  logistics: "仓储物流",
};

export const defaultAdminProducts: AdminProduct[] = mockProducts.map((p) => ({
  ...p,
  categoryId: p.categoryId,
  name: productNames[p.id] ?? p.model,
  images: [],
}));

export const defaultAdminCategories: AdminCategory[] = defaultCategorySeeds.map((c, i) => ({
  id: c.id,
  name: categoryNameMap[c.id] ?? c.id,
  icon: c.icon,
  sortOrder: defaultCategorySeeds.length - i,
}));

export const defaultAdminBrands: AdminBrand[] = [
  { id: "bosch", name: "Bosch", color: "#EA0016" },
  { id: "makita", name: "Makita", color: "#008C45" },
  { id: "schneider", name: "Schneider Electric", color: "#3DCD58" },
  { id: "abb", name: "ABB", color: "#FF000F" },
  { id: "skf", name: "SKF", color: "#0050B5" },
  { id: "3m", name: "3M", color: "#FF0000" },
  { id: "siemens", name: "Siemens", color: "#009999" },
  { id: "stanley", name: "Stanley", color: "#FFD100" },
  { id: "atlas-copco", name: "Atlas Copco", color: "#0064A4" },
  { id: "era", name: "ERA", color: "#F97316" },
  { id: "prysmian", name: "Prysmian", color: "#003DA5" },
  { id: "ansell", name: "Ansell", color: "#E31837" },
];

export const defaultAdminSettings: AdminSettings = {
  siteName: "速采云 SuCai Cloud",
  logo: "SC",
  contactEmail: "contact@sucaicloud.com",
  whatsapp: "+62 21 1234 5678",
  address: "印度尼西亚雅加达 · 中国深圳",
};
