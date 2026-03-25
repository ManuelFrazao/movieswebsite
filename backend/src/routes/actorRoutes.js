import express from "express";
import {
  createActor,
  getActors,
  getActorBySlug,
  updateActor,
  searchActors,
} from "../controllers/actorController.js";
import upload from "../middleware/upload.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, upload.single("image"), createActor);
router.get("/", getActors);
router.get("/search", searchActors);
router.get("/:slug", getActorBySlug);
router.put("/:id", protect, isAdmin, upload.single("image"), updateActor);

export default router;