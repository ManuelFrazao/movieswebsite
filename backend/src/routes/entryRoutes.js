import express from "express";
import {
  createEntry,
  getEntries,
  getEntryById,
  deleteEntry,
} from "../controllers/entryController.js";

import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, createEntry);
router.get("/", getEntries);
router.get("/:id", getEntryById);
router.delete("/:id", protect, isAdmin, deleteEntry);

export default router;