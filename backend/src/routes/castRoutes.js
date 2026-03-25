import express from "express";
import { addCast, getEntryCast } from "../controllers/castController.js";

const router = express.Router();

router.post("/", addCast);
router.get("/entry/:entryId", getEntryCast);

export default router;