import express from "express";

import authRoutes from "./authRoutes.js";
import adminRoutes from "./adminRoutes.js";
import entryRoutes from "./entryRoutes.js";
import seasonRoutes from "./seasonRoutes.js";
import episodeRoutes from "./episodeRoutes.js";
import voteRoutes from "./voteRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import castRoutes from "./castRoutes.js";
import actorRoutes from "./actorRoutes.js";
import characterRoutes from "./characterRoutes.js";
import characterAliasRoutes from "./characterAliasRoutes.js";
import watchlistRoutes from "./watchlistRoutes.js";
import favoriteRoutes from "./favoriteRoutes.js";
import imageRoutes from "./imageRoutes.js";
import videoRoutes from "./videoRoutes.js";
import commentRoutes from "./commentRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/entries", entryRoutes);
router.use("/seasons", seasonRoutes);
router.use("/episodes", episodeRoutes);
router.use("/votes", voteRoutes);
router.use("/reviews", reviewRoutes);
router.use("/cast", castRoutes);
router.use("/actors", actorRoutes);
router.use("/characters", characterRoutes);
router.use("/character-aliases", characterAliasRoutes);
router.use("/watchlist", watchlistRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/images", imageRoutes);
router.use("/videos", videoRoutes);
router.use("/comments", commentRoutes);

export default router;
