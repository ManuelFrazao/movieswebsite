import { Like } from "../models/index.js";

// toggle like
export const toggleLike = async (req, res) => {
  try {
    const { type, entryId, episodeId, reviewId } = req.body;
    const userId = req.user.id;

    const existing = await Like.findOne({
      where: {
        userId,
        type,
        entryId: entryId || null,
        episodeId: episodeId || null,
        reviewId: reviewId || null,
      },
    });

    if (existing) {
      await existing.destroy();
      return res.json({ liked: false });
    }

    await Like.create({
      userId,
      type,
      entryId,
      episodeId,
      reviewId,
    });

    res.json({ liked: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};