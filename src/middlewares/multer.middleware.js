import multer from "multer";

// Allowed image MIME types
const imageMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only image files (png, jpg, jpeg, webp, gif) are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB per file
  },
  fileFilter
});

export default upload;
