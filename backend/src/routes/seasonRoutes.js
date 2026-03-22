import express from "express";
import {
  createSeason,
  getSeasonsByEntry,
} from "../controllers/seasonController.js";

import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, createSeason);
router.get("/entry/:entryId", getSeasonsByEntry);

export default router;