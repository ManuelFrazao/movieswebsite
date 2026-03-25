import express from "express";
import {
  createCharacter,
  searchCharacters,
} from "../controllers/characterController.js";

const router = express.Router();

router.post("/", createCharacter);
router.get("/search", searchCharacters);

export default router;