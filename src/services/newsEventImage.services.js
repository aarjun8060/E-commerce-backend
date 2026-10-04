import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const uploadDirectory = fileURLToPath(
  new URL("../../public/uploads/news-events/", import.meta.url),
);

const imageTypes = {
  "image/jpeg": {
    extension: "jpg",
    matches: (buffer) =>
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff,
  },
  "image/png": {
    extension: "png",
    matches: (buffer) =>
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      ),
  },
  "image/webp": {
    extension: "webp",
    matches: (buffer) =>
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP",
  },
};

export const saveNewsEventImage = async (file) => {
  if (!file) return null;
  if (!imageTypes[file.mimetype]) {
    throw new Error("Image must be JPG, PNG, or WebP");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must not exceed 2 MB");
  }
  if (!imageTypes[file.mimetype].matches(file.buffer)) {
    throw new Error("Image content does not match its declared type");
  }

  const filename = `${randomUUID()}.${imageTypes[file.mimetype].extension}`;
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), file.buffer, { flag: "wx" });
  return `/uploads/news-events/${filename}`;
};

export const removeNewsEventImage = async (imagePath) => {
  if (!imagePath?.startsWith("/uploads/news-events/")) return;
  await unlink(path.join(uploadDirectory, path.basename(imagePath))).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
};
