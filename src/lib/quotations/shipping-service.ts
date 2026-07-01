interface ShippingItem {
  quantity: number;
  unitPrice: number;
}

interface DestinationRate {
  baseFee: number;
  perUnit: number;
  insuranceRate: number;
}

const DESTINATION_RATES: Record<string, DestinationRate> = {
  morowali: { baseFee: 980, perUnit: 48, insuranceRate: 0.02 },
  jakarta: { baseFee: 420, perUnit: 22, insuranceRate: 0.015 },
  surabaya: { baseFee: 520, perUnit: 26, insuranceRate: 0.015 },
  medan: { baseFee: 560, perUnit: 28, insuranceRate: 0.015 },
  makassar: { baseFee: 720, perUnit: 34, insuranceRate: 0.018 },
  balikpapan: { baseFee: 680, perUnit: 32, insuranceRate: 0.018 },
};

const DEFAULT_RATE: DestinationRate = {
  baseFee: 850,
  perUnit: 40,
  insuranceRate: 0.02,
};

function resolveRate(destinationCity: string): DestinationRate {
  const key = destinationCity.toLowerCase().replace(/[\s-]/g, "");
  return DESTINATION_RATES[key] ?? DEFAULT_RATE;
}

export function calculateShippingBreakdown(
  destinationCity: string,
  items: ShippingItem[],
  incoterms: string,
): { freight: number; insurance: number; total: number } {
  if (!destinationCity.trim()) {
    return { freight: 0, insurance: 0, total: 0 };
  }

  const incoterm = incoterms.toUpperCase();
  if (incoterm && !["CIF", "CFR", "CIP", "DDP"].includes(incoterm)) {
    return { freight: 0, insurance: 0, total: 0 };
  }

  const rate = resolveRate(destinationCity);
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const goodsValue = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const freight = Math.round((rate.baseFee + rate.perUnit * totalUnits) * 100) / 100;
  const insurance = Math.round(goodsValue * rate.insuranceRate * 100) / 100;

  return { freight, insurance, total: Math.round((freight + insurance) * 100) / 100 };
}

export function calculateShippingCost(
  destinationCity: string,
  items: ShippingItem[],
  incoterms: string,
): number {
  return calculateShippingBreakdown(destinationCity, items, incoterms).total;
}

export function buildShippingLineLabel(destinationCity: string, incoterms: string): string {
  const term = incoterms || "CIF";
  return `${term} Freight & Insurance → ${destinationCity}`;
}
