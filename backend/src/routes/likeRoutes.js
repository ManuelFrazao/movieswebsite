import express from "express";
import {
  toggleLike,
  getVideoLikes,
  getReviewLikes,
} from "../controllers/likeController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, toggleLike);
router.get("/:videoId", optionalAuth, getVideoLikes);
router.get("/review/:reviewId", getReviewLikes);

export default router;
