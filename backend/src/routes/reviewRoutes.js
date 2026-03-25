import express from "express";
import {
  createReview,
  getEntryReviews,
  getEpisodeReviews,
  getEpisodeReviewCount,
  getEntryReviewCount,
  deleteReview,
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/entry/:id", getEntryReviews);
router.get("/episode/:id", getEpisodeReviews);
router.get("/episode/:id/count", getEpisodeReviewCount);
router.get("/entry/:id/count", getEntryReviewCount);
router.delete("/:id", protect, deleteReview);

export default router;