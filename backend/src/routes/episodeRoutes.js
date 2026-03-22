import express from "express";
import {
  createEpisode,
  getEpisodesBySeason,
} from "../controllers/episodeController.js";

import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, createEpisode);
router.get("/season/:seasonId", getEpisodesBySeason);

export default router;