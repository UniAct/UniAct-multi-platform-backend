import { UploadApiResponse } from "cloudinary";
import cloudinary from "./CloudinaryConfig";

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
      },
      (err, result: UploadApiResponse | undefined) => {
        if (err || !result) {
          reject(err ?? new Error("Upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(urlOrId: string): Promise<void> {
  if (!urlOrId) return;

  const publicId = urlOrId.includes("cloudinary.com")
    ? urlOrId.split("/upload/")[1]?.replace(/^v\d+\//, "").replace(/\.[^.]+$/, "")
    : urlOrId;

  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId);
}
