const multer = require("multer");

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }
  const err = new Error("Only JPEG, PNG, and WebP images are allowed.");
  err.code = "INVALID_FILE_TYPE";
  cb(err, false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024,
  }
});

module.exports = upload;
