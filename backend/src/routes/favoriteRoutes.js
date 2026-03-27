import express from "express";
import {
  toggleFavorite,
  getActorFavoritesTrending,
  getCharacterFavoritesTrending
} from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔥 adicionar/remover (toggle)
router.post("/toggle", protect, toggleFavorite);
router.get("/actor/:id/trending", getActorFavoritesTrending);
router.get("/character/:id/trending", getCharacterFavoritesTrending);

export default router;
