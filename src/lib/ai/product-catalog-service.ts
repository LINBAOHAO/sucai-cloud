import { matchProductByText } from "@/lib/quotations/product-matcher";
import type { ShipLocation, StockStatus } from "@/lib/product-types";

const LOCATION_LABELS: Record<ShipLocation, string> = {
  shenzhen: "Shenzhen, China",
  guangzhou: "Guangzhou, China",
  yiwu: "Yiwu, China",
  ningbo: "Ningbo, China",
  shanghai: "Shanghai, China",
};

const STOCK_LABELS: Record<StockStatus, string> = {
  inStock: "In Stock",
  preOrder: "Pre-order",
};

function leadTimeDays(stockStatus: StockStatus, moq: number, quantity: number): number {
  if (stockStatus === "inStock") {
    return quantity <= moq * 2 ? 7 : 14;
  }
  return 21;
}

export async function queryProductInventory(productQuery: string): Promise<string> {
  const product = await matchProductByText(productQuery);
  if (!product) {
    return `Product not found: ${productQuery}`;
  }

  const stock = STOCK_LABELS[product.stockStatus as StockStatus] ?? product.stockStatus;
  return [
    `📦 ${product.name} (${product.model})`,
    `Status: ${stock}`,
    `MOQ: ${product.moq}`,
    `Unit price: USD ${Number(product.price).toFixed(2)}`,
  ].join("\n");
}

export async function queryProductLeadTime(
  productQuery: string,
  quantity = 1,
): Promise<string> {
  const product = await matchProductByText(productQuery);
  if (!product) {
    return `Product not found: ${productQuery}`;
  }

  const days = leadTimeDays(
    product.stockStatus as StockStatus,
    product.moq,
    quantity,
  );

  return [
    `⏱ ${product.name} (${product.model})`,
    `Estimated lead time: ${days} days`,
    `Stock: ${STOCK_LABELS[product.stockStatus as StockStatus] ?? product.stockStatus}`,
    `MOQ: ${product.moq}`,
  ].join("\n");
}

export async function queryProductWarehouse(productQuery: string): Promise<string> {
  const product = await matchProductByText(productQuery);
  if (!product) {
    return `Product not found: ${productQuery}`;
  }

  const warehouse =
    LOCATION_LABELS[product.location as ShipLocation] ?? String(product.location);

  return [
    `🏭 ${product.name} (${product.model})`,
    `Ship-from warehouse: ${warehouse}`,
    `SKU: ${product.sku}`,
  ].join("\n");
}

export function extractProductQueryFromMessage(message: string): string {
  const cleaned = message
    .replace(/^(stock|inventory|stok|库存|仓库|warehouse|gudang|交期|lead\s*time|delivery|pengiriman)\s*[：:?]?\s*/i, "")
    .trim();
  return cleaned || message.trim();
}
