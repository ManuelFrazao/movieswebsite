import express from "express";
import { addCast, getEntryCast, deleteCastByEntry } from "../controllers/castController.js";

const router = express.Router();

router.post("/", addCast);
router.get("/entry/:entryId", getEntryCast);
router.delete("/entry/:entryId", deleteCastByEntry);

export default router;