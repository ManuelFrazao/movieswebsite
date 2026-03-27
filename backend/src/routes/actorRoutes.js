import express from "express";
import {
  createActor,
  getActors,
  getActorBySlug,
  updateActor,
  searchActors,
  getActorById,
  deleteActor,
} from "../controllers/actorController.js";
import upload from "../middleware/upload.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin, upload.single("image"), createActor);
router.get("/", getActors);
router.get("/search", searchActors);
router.get("/slug/:slug", getActorBySlug);
router.put("/:id", protect, isAdmin, upload.single("image"), updateActor);
router.get("/:id", getActorById);
router.delete("/:id", protect, isAdmin, deleteActor);

export default router;