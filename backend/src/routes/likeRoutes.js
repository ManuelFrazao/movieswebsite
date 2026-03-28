import express from "express";
import { toggleLike, getVideoLikes } from "../controllers/likeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, toggleLike);
router.get("/:videoId", getVideoLikes);

export default router;