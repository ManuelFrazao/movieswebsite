import { Like } from "../models/index.js";
import { isSpamUser, SPAM_USER_ID } from "../utils/permissions.js";
import { Op } from "sequelize";

export const toggleLike = async (req, res) => {
  try {
    const { type, entryId, episodeId, reviewId, videoId, value } = req.body;
    const userId = req.user.id;
    const spam = isSpamUser(req);
    const likeValue = value === -1 ? -1 : 1;

    const where = {
      userId,
      type,
      entryId: entryId || null,
      episodeId: episodeId || null,
      reviewId: reviewId || null,
      videoId: videoId || null,
    };

    // count where excludes spam user
    const countWhere = {
      type,
      entryId: entryId || null,
      episodeId: episodeId || null,
      reviewId: reviewId || null,
      videoId: videoId || null,
      userId: { [Op.ne]: SPAM_USER_ID }, // 🔥 exclude spam user from counts
    };

    const existing = await Like.findOne({ where });

    if (existing) {
      if (existing.value === likeValue) {
        await existing.destroy();
      } else {
        await existing.update({ value: likeValue });
      }
    } else {
      await Like.create({ ...where, value: likeValue });
    }

    const likes = await Like.count({ where: { ...countWhere, value: 1 } });
    const dislikes = await Like.count({ where: { ...countWhere, value: -1 } });

    const current = await Like.findOne({ where });
    const userValue = current ? current.value : 0;

    res.json({ likes, dislikes, userValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getVideoLikes = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?.id;

    const countWhere = {
      type: "video",
      videoId,
      userId: { [Op.ne]: SPAM_USER_ID },
    };

    const likes = await Like.count({ where: { ...countWhere, value: 1 } });
    const dislikes = await Like.count({ where: { ...countWhere, value: -1 } });

    let userValue = 0;
    if (userId) {
      const existing = await Like.findOne({
        where: { userId, type: "video", videoId },
      });
      userValue = existing ? existing.value : 0;
    }

    res.json({ likes, dislikes, userValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReviewLikes = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;

    const countWhere = {
      type: "review",
      reviewId,
      userId: { [Op.ne]: SPAM_USER_ID },
    };

    const likes = await Like.count({ where: { ...countWhere, value: 1 } });
    const dislikes = await Like.count({ where: { ...countWhere, value: -1 } });

    let userValue = 0;
    if (userId) {
      const existing = await Like.findOne({
        where: { userId, type: "review", reviewId },
      });
      userValue = existing ? existing.value : 0;
    }

    res.json({ likes, dislikes, userValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
