import express from "express";
import { toggleLike } from "../controllers/likeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, toggleLike);

export default router;