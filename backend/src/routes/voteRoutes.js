import express from "express";
import {
  createVote,
  getEpisodeStats,
  getEntryStats,
  getEntryTrending,
  getTrendingEntries,
  getEpisodeTrending,
  getEntryEpisodesTrending,
  getEpisodeDistribution,
  deleteVote,
} from "../controllers/voteController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createVote);
router.get("/episode/:id/stats", getEpisodeStats);
router.get("/entry/:id/stats", getEntryStats);
router.get("/entry/:id/trending", getEntryTrending);
router.get("/trending", getTrendingEntries);
router.get("/episode/:id/trending", getEpisodeTrending);
router.get("/entry/:id/episodes-trending", getEntryEpisodesTrending);
router.get("/episode/:id/distribution", getEpisodeDistribution);
router.delete("/:id", protect, deleteVote);

export default router;