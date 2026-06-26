import { UploadApiResponse } from "cloudinary";
import cloudinary from "./CloudinaryConfig";

type CloudinaryFileReference = {
  publicId: string;
  format: string;
  resourceType: "image" | "video" | "raw";
  type: string;
};

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


export async function UploadRawFileToCloudinary(
  buffer: Buffer,
  folder: string,
  originalFileName: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
        filename_override: originalFileName,
      },
      (err, result: UploadApiResponse | undefined) => {
        if (err || !result) {
          reject(err ?? new Error("Upload failed"));
          return;
        }

        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    stream.end(buffer);
  });
}

function parseCloudinaryFileUrl(url: string): CloudinaryFileReference | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("cloudinary.com")) return null;

    const segments = parsed.pathname.split("/").filter(Boolean);
    const uploadIndex = segments.findIndex((segment) => segment === "upload");
    if (uploadIndex < 1 || uploadIndex >= segments.length - 1) return null;

    const rawResourceType = segments[uploadIndex - 1];
    const resourceType = rawResourceType === "files" ? "raw" : rawResourceType;
    if (resourceType !== "image" && resourceType !== "video" && resourceType !== "raw") {
      return null;
    }

    const publicPathSegments = segments.slice(uploadIndex + 1);
    if (publicPathSegments[0]?.match(/^v\d+$/)) {
      publicPathSegments.shift();
    }

    const fileName = publicPathSegments[publicPathSegments.length - 1];
    if (!fileName) return null;

    const dotIndex = fileName.lastIndexOf(".");
    const format = dotIndex >= 0 ? fileName.slice(dotIndex + 1) : "";
    if (!format) return null;

    publicPathSegments[publicPathSegments.length - 1] = fileName.slice(0, dotIndex);

    return {
      publicId: decodeURIComponent(publicPathSegments.join("/")),
      format,
      resourceType,
      type: segments[uploadIndex],
    };
  } catch {
    return null;
  }
}

export async function DownloadCloudinaryFile(url: string): Promise<ArrayBuffer | null> {
  const file = parseCloudinaryFileUrl(url);
  if (!file) return null;

  const signedUrl = cloudinary.utils.private_download_url(file.publicId, file.format, {
    resource_type: file.resourceType,
    type: file.type,
    expires_at: Math.floor(Date.now() / 1000) + 60,
    attachment: false,
  });

  const response = await fetch(signedUrl);
  if (!response.ok) {
    throw new Error(`Could not download Cloudinary material (${response.status})`);
  }

  return response.arrayBuffer();
}
