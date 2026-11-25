import multer from "multer";
import AppError from "../utils/AppError.js";

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new AppError("Only image and video files are allowed", 400));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB per file
});

export const productUpload = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "video", maxCount: 1 },
]);