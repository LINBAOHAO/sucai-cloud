import { PrismaClient } from "@prisma/client";
import { defaultAdminBrands, defaultAdminCategories, defaultAdminSettings } from "../src/lib/admin/defaults";
import { mockProducts } from "../src/lib/mock-products";

const prisma = new PrismaClient();

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

async function main() {
  console.log("Seeding categories...");
  const categoryIdBySlug = new Map<string, string>();
  for (const category of defaultAdminCategories) {
    const row = await prisma.category.upsert({
      where: { slug: category.id },
      create: {
        slug: category.id,
        name: category.name,
        icon: category.icon,
        sortOrder: category.sortOrder,
      },
      update: {
        name: category.name,
        icon: category.icon,
        sortOrder: category.sortOrder,
      },
    });
    categoryIdBySlug.set(category.id, row.id);
  }

  console.log("Seeding brands...");
  const brandIdBySlug = new Map<string, string>();
  for (const brand of defaultAdminBrands) {
    const row = await prisma.brand.upsert({
      where: { slug: brand.id },
      create: {
        slug: brand.id,
        name: brand.name,
        color: brand.color,
      },
      update: {
        name: brand.name,
        color: brand.color,
      },
    });
    brandIdBySlug.set(brand.id, row.id);
  }

  console.log("Seeding products...");
  for (const product of mockProducts) {
    const categoryId = categoryIdBySlug.get(product.categoryId);
    const brandId = brandIdBySlug.get(product.brandId);
    if (!categoryId || !brandId) {
      throw new Error(`Missing category or brand for product ${product.slug}`);
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      create: {
        slug: product.slug,
        sku: product.sku,
        name: productNames[product.id] ?? product.model,
        model: product.model,
        moq: product.moq,
        stockStatus: product.stockStatus,
        location: product.location,
        price: product.price,
        hotScore: product.hotScore,
        sortOrder: product.sortOrder,
        imageCount: product.imageCount,
        categoryId,
        brandId,
      },
      update: {
        sku: product.sku,
        name: productNames[product.id] ?? product.model,
        model: product.model,
        moq: product.moq,
        stockStatus: product.stockStatus,
        location: product.location,
        price: product.price,
        hotScore: product.hotScore,
        sortOrder: product.sortOrder,
        imageCount: product.imageCount,
        categoryId,
        brandId,
      },
    });
  }

  console.log("Seeding settings...");
  await prisma.setting.upsert({
    where: { key: "general" },
    create: {
      key: "general",
      siteName: defaultAdminSettings.siteName,
      logo: defaultAdminSettings.logo,
      contactEmail: defaultAdminSettings.contactEmail,
      whatsapp: defaultAdminSettings.whatsapp,
      address: defaultAdminSettings.address,
    },
    update: {
      siteName: defaultAdminSettings.siteName,
      logo: defaultAdminSettings.logo,
      contactEmail: defaultAdminSettings.contactEmail,
      whatsapp: defaultAdminSettings.whatsapp,
      address: defaultAdminSettings.address,
    },
  });

  const [categoryCount, brandCount, productCount, settingsCount] = await Promise.all([
    prisma.category.count(),
    prisma.brand.count(),
    prisma.product.count(),
    prisma.setting.count(),
  ]);

  console.log(
    `Seed complete: ${categoryCount} categories, ${brandCount} brands, ${productCount} products, ${settingsCount} settings.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
