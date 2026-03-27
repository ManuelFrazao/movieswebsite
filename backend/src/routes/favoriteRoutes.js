import express from "express";
import {
  toggleFavorite,
  getActorFavoritesTrending,
} from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔥 adicionar/remover (toggle)
router.post("/toggle", protect, toggleFavorite);
router.get("/actor/:id/trending", getActorFavoritesTrending);

export default router;
