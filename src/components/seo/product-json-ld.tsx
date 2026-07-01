import type { MockProduct } from "@/lib/product-types";
import { absoluteUrl, getDefaultOgImageUrl } from "@/lib/seo/metadata";

type ProductJsonLdProps = {
  locale: string;
  product: MockProduct;
  name: string;
  description: string;
  brandName: string;
};

function availabilityUrl(stockStatus: MockProduct["stockStatus"]): string {
  if (stockStatus === "inStock") {
    return "https://schema.org/InStock";
  }
  return "https://schema.org/PreOrder";
}

export function ProductJsonLd({
  locale,
  product,
  name,
  description,
  brandName,
}: ProductJsonLdProps) {
  const productUrl = absoluteUrl(locale, `/products/${product.slug}`);
  const image = product.primaryImageUrl ?? getDefaultOgImageUrl();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    sku: product.sku,
    model: product.model,
    url: productUrl,
    image: [image],
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "CNY",
      price: product.price,
      availability: availabilityUrl(product.stockStatus),
      seller: {
        "@type": "Organization",
        name: "SuCai Cloud",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
