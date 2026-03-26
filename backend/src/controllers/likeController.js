import { Like } from "../models/index.js";
import { isSpamUser } from "../utils/permissions.js";

// toggle like
export const toggleLike = async (req, res) => {
  try {
    const { type, entryId, episodeId, reviewId } = req.body;
    const userId = req.user.id;
    const spamUser = isSpamUser(req);

    const existing = await Like.findOne({
      where: {
        userId,
        type,
        entryId: entryId || null,
        episodeId: episodeId || null,
        reviewId: reviewId || null,
      },
    });

    // 🔥 SPAM USER → sempre cria
    if (spamUser) {
      await Like.create({
        userId,
        type,
        entryId,
        episodeId,
        reviewId,
      });

      const count = await Like.count({
        where: {
          type,
          entryId: entryId || null,
          episodeId: episodeId || null,
          reviewId: reviewId || null,
        },
      });

      return res.json({ liked: true, count });
    }

    // 👇 USER NORMAL
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

    await Like.create({
      userId,
      type,
      entryId,
      episodeId,
      reviewId,
    });

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
