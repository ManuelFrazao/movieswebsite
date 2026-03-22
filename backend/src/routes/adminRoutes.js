import express from "express";
import {
  getAllUsers,
  getAllEntries,
  updateUserRole,
  deleteUser
} from "../controllers/adminController.js";

import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 todas estas rotas são protegidas
router.use(protect, isAdmin);

// 👤 users
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// 🎬 entries
router.get("/entries", getAllEntries);

export default router;