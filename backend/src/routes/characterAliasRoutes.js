// routes/characterAliasRoutes.js
import express from "express";
import { addAlias } from "../controllers/characterAliasController.js";

const router = express.Router();

router.post("/", addAlias);

export default router;