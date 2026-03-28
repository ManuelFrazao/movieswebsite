import express from "express";
import { toggleLike, getVideoLikes } from "../controllers/likeController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, toggleLike);
router.get("/:videoId", optionalAuth, getVideoLikes);

export default router;