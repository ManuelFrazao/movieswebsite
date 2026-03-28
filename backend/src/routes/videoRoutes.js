import express from "express";
import { uploadVideo, getVideos, deleteVideo, setTrailer } from "../controllers/videoController.js";
import upload from "../middleware/upload.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, upload.single("video"), uploadVideo);
router.get("/:targetType/:targetId", getVideos);
router.delete("/:id", protect, isAdmin, deleteVideo);
router.patch("/:id/trailer", protect, isAdmin, setTrailer);

export default router;