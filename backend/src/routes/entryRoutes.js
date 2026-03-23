import express from "express";
import {
  createEntry,
  getEntries,
  getEntryById,
  getEntryBySlug,
  updateEntry,
  deleteEntry,
} from "../controllers/entryController.js";
import upload from "../middleware/upload.js";

import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, upload.single("image"), createEntry);
router.get("/", getEntries);
router.get("/:id", getEntryById);
router.get("/slug/:slug", getEntryBySlug);
router.put("/:id", protect, isAdmin, upload.single("image"), updateEntry);
router.delete("/:id", protect, isAdmin, deleteEntry);

export default router;