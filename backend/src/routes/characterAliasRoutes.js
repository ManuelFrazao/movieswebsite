import express from "express";
import {
  addAlias,
  bulkCharacterAlias,
} from "../controllers/characterAliasController.js";

const router = express.Router();

router.post("/", addAlias);
router.post("/bulk", bulkCharacterAlias);

export default router;