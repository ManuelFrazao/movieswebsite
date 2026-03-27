import express from "express";
import {
  createCharacter,
  searchCharacters,
  getCharacterById,
  getCharacterBySlug,
} from "../controllers/characterController.js";

const router = express.Router();

router.post("/", createCharacter);
router.get("/search", searchCharacters);
router.get("/:slug", getCharacterBySlug);
router.get("/:id", getCharacterById);

export default router;
