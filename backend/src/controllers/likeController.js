import { Like } from "../models/index.js";

export const toggleLike = async (req, res) => {
  try {
    const { type, entryId, episodeId, reviewId, videoId, value } = req.body;
    const userId = req.user.id;

    // value must be 1 or -1
    const likeValue = value === -1 ? -1 : 1;

    const where = {
      userId,
      type,
      entryId: entryId || null,
      episodeId: episodeId || null,
      reviewId: reviewId || null,
      videoId: videoId || null,
    };

    const countWhere = {
      type,
      entryId: entryId || null,
      episodeId: episodeId || null,
      reviewId: reviewId || null,
      videoId: videoId || null,
    };

    const existing = await Like.findOne({ where });

    if (existing) {
      if (existing.value === likeValue) {
        // clicking same button again → remove it
        await existing.destroy();
      } else {
        // switching from like to dislike or vice versa
        await existing.update({ value: likeValue });
      }
    } else {
      await Like.create({ ...where, value: likeValue });
    }

    const likes = await Like.count({ where: { ...countWhere, value: 1 } });
    const dislikes = await Like.count({ where: { ...countWhere, value: -1 } });

    // what is the current user's vote now
    const current = await Like.findOne({ where });
    const userValue = current ? current.value : 0;

    res.json({ likes, dislikes, userValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};