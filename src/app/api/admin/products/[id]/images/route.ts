import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  listProductImages,
  reorderProductImages,
  setPrimaryProductImage,
  uploadProductImage,
} from "@/lib/products/product-image-repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const images = await listProductImages(id);
    return NextResponse.json(images);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list images";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const alt = formData.get("alt");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const image = await uploadProductImage(
      id,
      {
        name: file.name,
        type: file.type,
        size: file.size,
        buffer,
      },
      typeof alt === "string" && alt.trim() ? alt.trim() : undefined,
    );

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image";
    const status = message.includes("not configured") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      action: "reorder" | "setPrimary";
      imageIds?: string[];
      imageId?: string;
    };

    if (body.action === "reorder" && body.imageIds) {
      const images = await reorderProductImages(id, body.imageIds);
      return NextResponse.json(images);
    }

    if (body.action === "setPrimary" && body.imageId) {
      const images = await setPrimaryProductImage(id, body.imageId);
      return NextResponse.json(images);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update images";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
