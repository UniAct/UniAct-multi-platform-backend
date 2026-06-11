import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";

export const MAX_FILE_SIZE_MB = 5;

// When handling file uploads, we have two options:
// 1) Store the file on disk (diskStorage) → useful for large files or long-term storage,
//    but adds disk I/O overhead and requires manual cleanup.
// 2) Store the file in memory (memoryStorage) → keeps the file in RAM as a buffer,
//    which is faster and avoids disk operations, but should only be used for small files.
//
// In our case, the Excel file is small (max ~5,000 rows × 12 columns ≈ a few MB),
// and will be processed immediately (no need to persist it).
// So using memoryStorage is more efficient and simpler.
const storage = multer.memoryStorage();


const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === ".xlsx") {
    cb(null, true);
  } else {
    cb(new Error("Only .xlsx files are allowed"));
  }
};

export const uploadExcel = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
}).single("file");

const imageFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 3 * 1024 * 1024,
    files: 1,
  },
}).single("image");
