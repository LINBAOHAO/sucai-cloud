"use client";

import { useTranslations } from "next-intl";
import { resolveBrandName } from "@/lib/catalog/catalog-display";
import { getProductDetailExtra } from "@/lib/product-detail-content";
import type { MockProduct } from "@/lib/product-types";
import type { Locale } from "@/i18n/routing";

interface ProductSpecsTableProps {
  product: MockProduct;
  locale: Locale;
  brandLabels: Record<string, string>;
}

const specKeys = [
  "brand",
  "model",
  "material",
  "dimensions",
  "weight",
  "certification",
  "origin",
] as const;

export function ProductSpecsTable({ product, locale, brandLabels }: ProductSpecsTableProps) {
  const td = useTranslations("productDetail");
  const extra = getProductDetailExtra(locale, product.id);
  const specs = td.raw(`items.${product.id}.specs`) as Record<string, string>;

  const values: Record<(typeof specKeys)[number], string> = {
    brand: resolveBrandName(product.brandId, brandLabels),
    model: product.model,
    material: specs.material,
    dimensions: specs.dimensions,
    weight: specs.weight,
    certification: specs.certification,
    origin: extra.origin,
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      <table className="w-full text-sm">
        <tbody>
          {specKeys.map((key, index) => (
            <tr
              key={key}
              className={index % 2 === 0 ? "bg-slate-50/60" : "bg-white"}
            >
              <th className="w-2/5 border-b border-slate-100 px-5 py-4 text-left font-medium text-slate-500 sm:px-6">
                {td(`specLabels.${key}`)}
              </th>
              <td className="border-b border-slate-100 px-5 py-4 font-medium text-slate-800 sm:px-6">
                {values[key]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
