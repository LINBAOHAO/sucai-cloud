export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const normalized = slugify(base) || `item-${Date.now()}`;
  if (!(await exists(normalized))) return normalized;
  return `${normalized}-${Date.now()}`;
}
