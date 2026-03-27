import express from "express";
import {
  addCast,
  getEntryCast,
  deleteCastByEntry,
  replaceCast,
  getCharactersByEntry,
} from "../controllers/castController.js";

const router = express.Router();

router.post("/", addCast);
router.get("/entry/:entryId", getEntryCast);
router.delete("/entry/:entryId", deleteCastByEntry);
router.post("/bulk", replaceCast);
router.get("/characters/entry/:entryId", getCharactersByEntry)

export default router;
