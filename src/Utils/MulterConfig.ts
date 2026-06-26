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
export const MAX_POST_FILE_SIZE_MB = 25;
export const MAX_POST_FILES = 5;

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

const allowedPostFileExtensions = [
  ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx",
  ".zip", ".rar", ".txt", ".jpg", ".jpeg", ".png", ".webp",
];

const postFilesFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedPostFileExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not allowed`));
  }
};

export const uploadPostAttachments = multer({
  storage,
  fileFilter: postFilesFilter,
  limits: {
    fileSize: MAX_POST_FILE_SIZE_MB * 1024 * 1024,
    files: MAX_POST_FILES,
  },
}).array("files", MAX_POST_FILES);