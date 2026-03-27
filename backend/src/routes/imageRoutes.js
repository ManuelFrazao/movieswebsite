import express from "express";
import { uploadImage, getImages, deleteImage } from "../controllers/imageController.js";
import upload from "../middleware/upload.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, upload.single("image"), uploadImage);
router.get("/:targetType/:targetId", getImages);
router.delete("/:id", protect, isAdmin, deleteImage);

export default router;