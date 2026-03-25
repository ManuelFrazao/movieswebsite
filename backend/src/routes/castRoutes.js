import express from "express";
import {
  addCast,
  getEntryCast,
  deleteCastByEntry,
  replaceCast,
} from "../controllers/castController.js";

const router = express.Router();

router.post("/", addCast);
router.get("/entry/:entryId", getEntryCast);
router.delete("/entry/:entryId", deleteCastByEntry);
router.post("/bulk", replaceCast);

export default router;
