import { Like } from "../models/index.js";
import { isSpamUser } from "../utils/permissions.js";

export const toggleLike = async (req, res) => {
  try {
    const { type, entryId, episodeId, reviewId } = req.body;
    const userId = req.user.id;
    const spamUser = isSpamUser(req);

    const where = {
      userId,
      type,
      entryId: entryId || null,
      episodeId: episodeId || null,
      reviewId: reviewId || null,
    };

    const existing = await Like.findOne({ where });

    // =====================
    // 👑 ADMIN (spam controlado + toggle)
    // =====================
    if (spamUser) {
      if (existing) {
        await existing.destroy();
      } else {
        await Like.create(where);
      }

      const count = await Like.count({
        where: {
          type,
          entryId: entryId || null,
          episodeId: episodeId || null,
          reviewId: reviewId || null,
        },
      });

      return res.json({ liked: !existing, count });
    }

    // =====================
    // 👤 USER NORMAL (toggle)
    // =====================
    if (existing) {
      await existing.destroy();

      const count = await Like.count({
        where: {
          type,
          entryId: entryId || null,
          episodeId: episodeId || null,
          reviewId: reviewId || null,
        },
      });

      return res.json({ liked: false, count });
    }

    await Like.create(where);

    const count = await Like.count({
      where: {
        type,
        entryId: entryId || null,
        episodeId: episodeId || null,
        reviewId: reviewId || null,
      },
    });

    res.json({ liked: true, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
