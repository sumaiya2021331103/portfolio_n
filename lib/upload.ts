import { browserClient, MEDIA_BUCKET } from "./supabase";

const MAX_SIDE = 2000;

/** Shrinks large photos in the browser so uploads are fast and storage stays small. */
async function shrink(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp|heic|heif|bmp)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_500_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadFile(file: File, folder: string): Promise<string> {
  const db = browserClient();
  if (!db) throw new Error("Supabase is not connected");
  const body = await shrink(file);
  const ext = body === file ? (file.name.split(".").pop() || "bin").toLowerCase() : "webp";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await db.storage.from(MEDIA_BUCKET).upload(path, body, {
    contentType: body.type || file.type || undefined,
    cacheControl: "31536000",
  });
  if (error) throw error;
  return db.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}
