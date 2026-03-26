import express from "express";
import { toggleFavorite } from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔥 adicionar/remover (toggle)
router.post("/toggle", protect, toggleFavorite);

export default router;