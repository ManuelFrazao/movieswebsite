import express from "express";
import { toggleWatchlist } from "../controllers/watchlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// add/remove (toggle)
router.post("/toggle", protect, toggleWatchlist);

export default router;