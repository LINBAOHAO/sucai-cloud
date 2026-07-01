import type { ProductImage } from "@prisma/client";
import { deleteProductImageFile, uploadProductImageFile, type ImageUploadInput } from "@/lib/storage/image-upload";
import { extractStoragePathFromPublicUrl, deleteObjects } from "@/lib/storage/storage-repository";
import { prisma } from "@/lib/prisma";

export type ProductImageRecord = {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

function mapImage(record: ProductImage): ProductImageRecord {
  return {
    id: record.id,
    productId: record.productId,
    url: record.url,
    alt: record.alt,
    sortOrder: record.sortOrder,
  };
}

async function syncProductImageCount(productId: string): Promise<void> {
  const count = await prisma.productImage.count({ where: { productId } });
  await prisma.product.update({
    where: { id: productId },
    data: { imageCount: count },
  });
}

export async function listProductImages(productId: string): Promise<ProductImageRecord[]> {
  const records = await prisma.productImage.findMany({
    where: { productId },
    orderBy: { sortOrder: "asc" },
  });
  return records.map(mapImage);
}

export async function uploadProductImage(
  productId: string,
  input: ImageUploadInput,
  alt?: string,
): Promise<ProductImageRecord> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new Error("Product not found");
  }

  const { url } = await uploadProductImageFile(productId, input);
  const maxSort = await prisma.productImage.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

  const record = await prisma.productImage.create({
    data: {
      productId,
      url,
      alt: alt ?? product.name,
      sortOrder,
    },
  });

  await syncProductImageCount(productId);
  return mapImage(record);
}

export async function deleteProductImage(imageId: string): Promise<boolean> {
  const record = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!record) return false;

  await deleteProductImageFile(record.url);

  await prisma.productImage.delete({ where: { id: imageId } });
  await syncProductImageCount(record.productId);
  return true;
}

export async function reorderProductImages(productId: string, imageIds: string[]): Promise<ProductImageRecord[]> {
  const existing = await prisma.productImage.findMany({ where: { productId } });
  if (existing.length !== imageIds.length) {
    throw new Error("Invalid image order");
  }

  const idSet = new Set(imageIds);
  if (idSet.size !== imageIds.length || !existing.every((item) => idSet.has(item.id))) {
    throw new Error("Invalid image order");
  }

  await prisma.$transaction(
    imageIds.map((id, index) =>
      prisma.productImage.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  return listProductImages(productId);
}

export async function setPrimaryProductImage(productId: string, imageId: string): Promise<ProductImageRecord[]> {
  const images = await listProductImages(productId);
  const index = images.findIndex((image) => image.id === imageId);
  if (index === -1) {
    throw new Error("Image not found");
  }

  const orderedIds = [imageId, ...images.filter((image) => image.id !== imageId).map((image) => image.id)];
  return reorderProductImages(productId, orderedIds);
}

export async function deleteAllProductImages(productId: string): Promise<void> {
  const images = await prisma.productImage.findMany({ where: { productId } });
  const paths = images
    .map((image) => extractStoragePathFromPublicUrl(image.url))
    .filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    await deleteObjects(paths);
  }

  await prisma.productImage.deleteMany({ where: { productId } });
  await syncProductImageCount(productId);
}
