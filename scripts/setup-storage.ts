import { ensureProductImagesBucket } from "../src/lib/storage/storage-repository";

async function main() {
  console.log("Ensuring Supabase Storage bucket: product-images...");
  await ensureProductImagesBucket();
  console.log("Storage bucket ready.");
}

main().catch((error) => {
  console.error("Storage setup failed:", error);
  process.exit(1);
});
