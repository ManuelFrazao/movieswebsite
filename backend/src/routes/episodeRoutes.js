import express from "express";
import {
  createEpisode,
  getEpisodesBySeason,
  deleteEpisode,
  updateEpisode,
} from "../controllers/episodeController.js";
import upload from "../middleware/upload.js";

import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, upload.single("image"), createEpisode);
router.get("/season/:seasonId", getEpisodesBySeason);
router.put("/:id", protect, isAdmin, updateEpisode);
router.delete("/:id", protect, isAdmin, deleteEpisode);

export default router;