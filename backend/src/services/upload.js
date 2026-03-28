import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB to support videos
  fileFilter: (req, file, cb) => {
    const allowed = ["image/", "video/"];
    if (allowed.some((type) => file.mimetype.startsWith(type))) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"));
    }
  },
});

export default upload;