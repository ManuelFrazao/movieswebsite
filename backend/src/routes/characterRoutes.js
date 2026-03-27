import express from "express";
import {
  createCharacter,
  searchCharacters,
  getCharacterById,
  getCharacterBySlug,
  updateCharacter,
} from "../controllers/characterController.js";
import upload from "../middleware/upload.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", upload.single("image"), createCharacter);
router.get("/search", searchCharacters);
router.get("/slug/:slug", getCharacterBySlug);
router.get("/:id", getCharacterById);
router.put("/:id", upload.single("image"), updateCharacter);

export default router;
