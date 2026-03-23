import express from "express";
import {
  createSeason,
  getSeasonsByEntry,
  deleteSeason,
} from "../controllers/seasonController.js";

import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, createSeason);
router.post("/entries/:entryId", protect, isAdmin, createSeason);
router.get("/entry/:entryId", getSeasonsByEntry);
router.delete("/:id", protect, isAdmin, deleteSeason);

export default router;