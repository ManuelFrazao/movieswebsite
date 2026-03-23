import express from "express";
import {
  createEpisode,
  getEpisodesBySeason,
} from "../controllers/episodeController.js";
import upload from "../middleware/upload.js";

import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, upload.single("image"), createEpisode);
router.get("/season/:seasonId", getEpisodesBySeason);

export default router;