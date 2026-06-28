"use client";

import { useTranslations } from "next-intl";

interface ProductSpecsTableProps {
  productId: string;
}

const specKeys = [
  "voltage",
  "power",
  "material",
  "dimensions",
  "weight",
  "certification",
] as const;

export function ProductSpecsTable({ productId }: ProductSpecsTableProps) {
  const td = useTranslations("productDetail");

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-xl font-bold sm:text-2xl">
        <span className="text-gradient">{td("specsTitle")}</span>
      </h2>
      <div className="glass-card overflow-hidden rounded-xl">
        <table className="w-full text-sm">
          <tbody>
            {specKeys.map((key, index) => (
              <tr
                key={key}
                className={index % 2 === 0 ? "bg-white/[0.02]" : undefined}
              >
                <th className="w-1/3 border-b border-white/10 px-6 py-4 text-left font-medium text-muted-foreground">
                  {td(`specLabels.${key}`)}
                </th>
                <td className="border-b border-white/10 px-6 py-4 font-medium">
                  {td(`items.${productId}.specs.${key}`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
