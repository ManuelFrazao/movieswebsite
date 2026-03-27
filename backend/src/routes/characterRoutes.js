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
router.get("/:id", getCharacterById);
router.get("/:slug", getCharacterBySlug);

export default router;
