import type { Locale } from "@/i18n/routing";
import { SLUG_TO_MOCK_ID } from "@/lib/products/product-mapper";

type Localized<T> = Record<Locale, T>;

export interface ProductDetailExtra {
  shipFrom: string;
  deliveryTime: string;
  origin: string;
  applications: string;
  packaging: string;
}

const zhExtras: Record<string, ProductDetailExtra> = {
  p1: {
    shipFrom: "Jakarta",
    deliveryTime: "3–7 个工作日",
    origin: "中国",
    applications: "工厂车间金属加工、钢结构切割打磨、设备维修维护、工程项目现场作业。",
    packaging: "单台彩盒包装，外箱纸箱加固；批量订单可打托盘，支持海运/空运至印尼各港口。",
  },
  p2: {
    shipFrom: "Surabaya",
    deliveryTime: "3–7 个工作日",
    origin: "中国 / 日本",
    applications: "金属加工、焊接后处理、工程承包商现场维修、制造业生产线维护。",
    packaging: "原厂彩盒 + 五层瓦楞外箱；批量供应可按项目定制包装与标签。",
  },
  p3: {
    shipFrom: "Jakarta",
    deliveryTime: "3–5 个工作日",
    origin: "法国 / 中国",
    applications: "工业电机控制、自动化配电系统、生产线设备改造、楼宇机电工程。",
    packaging: "防静电袋 + 内盒，外箱标准出口包装；批量订单提供装箱清单与批次追溯。",
  },
  p4: {
    shipFrom: "Jakarta",
    deliveryTime: "3–5 个工作日",
    origin: "德国 / 中国",
    applications: "工业配电柜、建筑电气系统、工厂动力配电、项目工程批量配套。",
    packaging: "独立内盒包装，外箱防潮处理；支持项目整柜配送至印尼本地仓库。",
  },
  p5: {
    shipFrom: "Semarang",
    deliveryTime: "5–10 个工作日",
    origin: "中国",
    applications: "工厂车间、仓储物流、建筑施工、矿业及重工行业劳保防护。",
    packaging: "每双独立袋装，12 双/箱；支持企业 LOGO 定制鞋盒及批量分码包装。",
  },
  p6: {
    shipFrom: "Jakarta",
    deliveryTime: "7–14 个工作日",
    origin: "中国",
    applications: "建筑工地、工厂车间、户外作业、电力及石化行业头部防护。",
    packaging: "6 顶/箱标准出口包装；支持丝印 LOGO 及项目定制配色批量供货。",
  },
  p7: {
    shipFrom: "Surabaya",
    deliveryTime: "7–14 个工作日",
    origin: "中国",
    applications: "食品、化工、制药行业管道系统、工业冷却水及耐腐蚀流体输送。",
    packaging: "单根塑料膜缠绕 + 木架/铁架固定；6m 标准长度，可按需切割供应。",
  },
  p8: {
    shipFrom: "Medan",
    deliveryTime: "3–7 个工作日",
    origin: "中国",
    applications: "建筑给水系统、工业冷却水、市政管网及厂房配管工程。",
    packaging: "4m 标准长度捆扎包装，外覆保护膜；批量项目支持直发工地或本地仓。",
  },
  p9: {
    shipFrom: "Bandung",
    deliveryTime: "5–10 个工作日",
    origin: "中国",
    applications: "化工、电力、市政工程蒸汽/水/油品管道系统，工业流程控制。",
    packaging: "木箱 + 防潮防锈处理，附带产品合格证与安装说明；大型阀门支持定制木架。",
  },
  p10: {
    shipFrom: "Jakarta",
    deliveryTime: "3–5 个工作日",
    origin: "瑞典 / 中国",
    applications: "电机、泵、减速机、传动设备及各类工业机械维护保养。",
    packaging: "SKF 原厂盒装，外箱标准出口包装；批量订单支持定期补货协议配送。",
  },
  p11: {
    shipFrom: "Jakarta",
    deliveryTime: "3–5 个工作日",
    origin: "瑞典",
    applications: "轴承润滑、齿轮传动、工业设备日常维护及现场维修补给。",
    packaging: "400g 管装，20 管/箱；运输全程防压防震，支持本地仓常备库存。",
  },
  p12: {
    shipFrom: "Surabaya",
    deliveryTime: "3–7 个工作日",
    origin: "中国 / 日本",
    applications: "工程团队现场作业、工厂维修部门、仓储物流工具管理。",
    packaging: "单件彩盒 + 外箱，批量订单可打托盘；支持混合 SKU 组合发货。",
  },
};

const enExtras: Record<string, ProductDetailExtra> = {
  p1: {
    shipFrom: "Jakarta",
    deliveryTime: "3–7 business days",
    origin: "China",
    applications: "Factory metal processing, steel structure cutting, equipment maintenance, and on-site project work.",
    packaging: "Individual color box with reinforced outer carton; bulk orders palletized for sea/air freight to Indonesia.",
  },
  p2: {
    shipFrom: "Surabaya",
    deliveryTime: "3–7 business days",
    origin: "China / Japan",
    applications: "Metal processing, post-welding work, contractor field repairs, and production line maintenance.",
    packaging: "Original box with 5-ply outer carton; project-based custom packaging and labeling available.",
  },
  p3: {
    shipFrom: "Jakarta",
    deliveryTime: "3–5 business days",
    origin: "France / China",
    applications: "Industrial motor control, automation panels, production line upgrades, and MEP projects.",
    packaging: "Anti-static bag with inner box and standard export outer carton; packing lists provided for bulk orders.",
  },
  p4: {
    shipFrom: "Jakarta",
    deliveryTime: "3–5 business days",
    origin: "Germany / China",
    applications: "Industrial distribution panels, building electrical systems, and project bulk supply.",
    packaging: "Individual inner box with moisture-resistant outer carton; full-container delivery to local warehouses.",
  },
  p5: {
    shipFrom: "Semarang",
    deliveryTime: "5–10 business days",
    origin: "China",
    applications: "Factory workshops, warehousing, construction sites, mining, and heavy industry PPE.",
    packaging: "Individual bag, 12 pairs per carton; custom logo boxes and size-sorted bulk packing available.",
  },
  p6: {
    shipFrom: "Jakarta",
    deliveryTime: "7–14 business days",
    origin: "China",
    applications: "Construction sites, factory floors, outdoor work, and power/petrochemical head protection.",
    packaging: "6 units per export carton; custom logo printing and color options for bulk orders.",
  },
  p7: {
    shipFrom: "Surabaya",
    deliveryTime: "7–14 business days",
    origin: "China",
    applications: "Food, chemical, and pharmaceutical piping, industrial cooling, and corrosive fluid transport.",
    packaging: "Film-wrapped single pipes with wooden/steel frame; standard 6m length with custom cutting.",
  },
  p8: {
    shipFrom: "Medan",
    deliveryTime: "3–7 business days",
    origin: "China",
    applications: "Building water supply, industrial cooling water, municipal networks, and plant piping.",
    packaging: "4m bundled lengths with protective film; bulk direct-to-site or local warehouse delivery.",
  },
  p9: {
    shipFrom: "Bandung",
    deliveryTime: "5–10 business days",
    origin: "China",
    applications: "Chemical, power, and municipal steam/water/oil pipeline systems and process control.",
    packaging: "Wooden crate with rust prevention, certificate and manual included; custom crating for large valves.",
  },
  p10: {
    shipFrom: "Jakarta",
    deliveryTime: "3–5 business days",
    origin: "Sweden / China",
    applications: "Motors, pumps, gearboxes, transmission equipment, and industrial machinery maintenance.",
    packaging: "SKF original box with export outer carton; replenishment agreements for bulk orders.",
  },
  p11: {
    shipFrom: "Jakarta",
    deliveryTime: "3–5 business days",
    origin: "Sweden",
    applications: "Bearing lubrication, gear drives, industrial maintenance, and field service supply.",
    packaging: "400g tubes, 20 tubes per carton; shock-proof shipping with local warehouse stocking.",
  },
  p12: {
    shipFrom: "Surabaya",
    deliveryTime: "3–7 business days",
    origin: "China / Japan",
    applications: "Field engineering teams, factory maintenance departments, and warehouse tool management.",
    packaging: "Single color box with outer carton; palletized bulk orders with mixed SKU shipping.",
  },
};

const idExtras: Record<string, ProductDetailExtra> = {
  p1: {
    shipFrom: "Jakarta",
    deliveryTime: "3–7 hari kerja",
    origin: "China",
    applications: "Pemrosesan logam pabrik, pemotongan struktur baja, perawatan peralatan, dan pekerjaan proyek lapangan.",
    packaging: "Kotak warna per unit dengan karton luar diperkuat; pesanan bulk dipalletkan untuk pengiriman ke Indonesia.",
  },
  p2: {
    shipFrom: "Surabaya",
    deliveryTime: "3–7 hari kerja",
    origin: "China / Jepang",
    applications: "Pemrosesan logam, pasca-las, perbaikan lapangan kontraktor, dan perawatan lini produksi.",
    packaging: "Kotak asli dengan karton luar 5-lapis; kemasan dan label khusus proyek tersedia.",
  },
  p3: {
    shipFrom: "Jakarta",
    deliveryTime: "3–5 hari kerja",
    origin: "Prancis / China",
    applications: "Kontrol motor industri, panel otomasi, upgrade lini produksi, dan proyek MEP.",
    packaging: "Kantong anti-statis dengan kotak dalam dan karton ekspor standar; daftar packing untuk pesanan bulk.",
  },
  p4: {
    shipFrom: "Jakarta",
    deliveryTime: "3–5 hari kerja",
    origin: "Jerman / China",
    applications: "Panel distribusi industri, sistem kelistrikan bangunan, dan pasokan bulk proyek.",
    packaging: "Kotak dalam individual dengan karton luar tahan lembap; pengiriman kontainer penuh ke gudang lokal.",
  },
  p5: {
    shipFrom: "Semarang",
    deliveryTime: "5–10 hari kerja",
    origin: "China",
    applications: "Bengkel pabrik, pergudangan, lokasi konstruksi, pertambangan, dan APD industri berat.",
    packaging: "Kantong individual, 12 pasang per karton; kotak logo kustom dan packing bulk per ukuran.",
  },
  p6: {
    shipFrom: "Jakarta",
    deliveryTime: "7–14 hari kerja",
    origin: "China",
    applications: "Lokasi konstruksi, lantai pabrik, pekerjaan outdoor, dan perlindungan kepala industri.",
    packaging: "6 unit per karton ekspor; cetak logo kustom dan opsi warna untuk pesanan bulk.",
  },
  p7: {
    shipFrom: "Surabaya",
    deliveryTime: "7–14 hari kerja",
    origin: "China",
    applications: "Pipa industri makanan, kimia, farmasi, pendingin industri, dan fluida korosif.",
    packaging: "Pipa dibungkus film dengan rangka kayu/baja; panjang standar 6m dengan pemotongan kustom.",
  },
  p8: {
    shipFrom: "Medan",
    deliveryTime: "3–7 hari kerja",
    origin: "China",
    applications: "Pasokan air bangunan, pendingin industri, jaringan municipal, dan pipa pabrik.",
    packaging: "Panjang 4m dibundel dengan film pelindung; pengiriman bulk langsung ke lokasi atau gudang lokal.",
  },
  p9: {
    shipFrom: "Bandung",
    deliveryTime: "5–10 hari kerja",
    origin: "China",
    applications: "Sistem pipa uap/air/minyak industri kimia, tenaga, dan municipal.",
    packaging: "Peti kayu dengan pencegahan karat, sertifikat dan manual; crating kustom untuk katup besar.",
  },
  p10: {
    shipFrom: "Jakarta",
    deliveryTime: "3–5 hari kerja",
    origin: "Swedia / China",
    applications: "Motor, pompa, gearbox, peralatan transmisi, dan perawatan mesin industri.",
    packaging: "Kotak asli SKF dengan karton ekspor; perjanjian replenishment untuk pesanan bulk.",
  },
  p11: {
    shipFrom: "Jakarta",
    deliveryTime: "3–5 hari kerja",
    origin: "Swedia",
    applications: "Pelumasan bearing, roda gigi, perawatan industri, dan pasokan layanan lapangan.",
    packaging: "Tabung 400g, 20 tabung per karton; pengiriman anti-guncang dengan stok gudang lokal.",
  },
  p12: {
    shipFrom: "Surabaya",
    deliveryTime: "3–7 hari kerja",
    origin: "China / Jepang",
    applications: "Tim engineering lapangan, departemen perawatan pabrik, dan manajemen alat gudang.",
    packaging: "Kotak warna tunggal dengan karton luar; pesanan bulk dipalletkan dengan pengiriman SKU campuran.",
  },
};

export const productDetailExtras: Localized<Record<string, ProductDetailExtra>> = {
  zh: zhExtras,
  en: enExtras,
  id: idExtras,
};

const defaultExtra: ProductDetailExtra = {
  shipFrom: "Jakarta",
  deliveryTime: "3–7 business days",
  origin: "China",
  applications: "Industrial procurement and B2B supply.",
  packaging: "Standard export packaging; bulk orders available on request.",
};

export function getProductDetailExtra(locale: Locale, productId: string, slug?: string): ProductDetailExtra {
  const contentId =
    productDetailExtras[locale][productId] !== undefined
      ? productId
      : slug && SLUG_TO_MOCK_ID[slug]
        ? SLUG_TO_MOCK_ID[slug]
        : productId;
  return (
    productDetailExtras[locale][contentId] ??
    productDetailExtras.zh[contentId] ??
    defaultExtra
  );
}
