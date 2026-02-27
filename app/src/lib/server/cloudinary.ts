import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import os from "os";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Save a FormData File to a temporary path on disk so it can be uploaded to Cloudinary.
 */
export async function saveFormDataFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const tempPath = path.join(os.tmpdir(), `upload-${Date.now()}-${safeName}`);
  await writeFile(tempPath, buffer);
  return tempPath;
}

/**
 * Upload a local file to Cloudinary.
 * Deletes the local file after upload (success or failure).
 */
const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Delete the local temp file after successful upload
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // Remove the locally saved temporary file as the upload failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

/**
 * Extract Cloudinary public_id from a URL.
 */
function getPublicIdFromUrl(url: string) {
  const parts = url.split("/");
  const fileNameWithExtension = parts[parts.length - 1];
  const fileName = fileNameWithExtension.split(".")[0];
  return fileName;
}

/**
 * Delete a file from Cloudinary by its URL.
 */
const deleteFromCloudinary = async (url: string) => {
  try {
    const public_Id = getPublicIdFromUrl(url);

    const ext = url.split(".").pop()?.toLowerCase();
    const resourceType =
      ext === "mp4" || ext === "mov" || ext === "avi" || ext === "mkv"
        ? "video"
        : "image";

    const res = await cloudinary.uploader.destroy(public_Id, {
      resource_type: resourceType,
    });

    return res;
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
