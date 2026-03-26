import {
  Review,
  Vote,
  Episode,
  Like,
  User,
  Season,
  Entry,
} from "../models/index.js";
import { Op } from "sequelize";
import { isSpamUser } from "../utils/permissions.js";

// =====================
// CREATE REVIEW
// =====================
export const createReview = async (req, res) => {
  try {
    const { content, type, entryId, episodeId, rating: inputRating } = req.body;
    const userId = req.user.id;

    const spamUser = isSpamUser(req);

    let finalRating = null;

    // 🎬 ENTRY
    if (type === "entry") {
      const entry = await Entry.findByPk(entryId);

      if (!entry) {
        return res.status(404).json({ message: "Entry não encontrada" });
      }

      if (inputRating) {
        finalRating = inputRating;
      } else if (entry.type !== "series") {
        const vote = await Vote.findOne({
          where: { userId, entryId },
        });

        if (!vote) {
          return res.status(400).json({
            message: "Tens de avaliar o filme antes de fazer review",
          });
        }

        finalRating = vote.value;
      } else {
        const votes = await Vote.findAll({
          where: { userId },
          include: {
            model: Episode,
            as: "episode",
            where: { entryId },
          },
        });

        if (!votes.length) {
          return res.status(400).json({
            message: "Tens de avaliar episódios antes de fazer review",
          });
        }

        const avg = votes.reduce((sum, v) => sum + v.value, 0) / votes.length;

        finalRating = Number(avg.toFixed(1));
      }
    }

    // 📺 EPISODE
    if (type === "episode") {
      if (inputRating) {
        finalRating = inputRating;
      } else {
        const vote = await Vote.findOne({
          where: { userId, episodeId },
        });

        if (!vote) {
          return res.status(400).json({
            message: "Tens de avaliar o episódio antes de fazer review",
          });
        }

        finalRating = vote.value;
      }
    }

    // =====================
    // 🔥 BLOQUEIO DE DUPLICADOS
    // =====================
    if (!spamUser) {
      const existing = await Review.findOne({
        where: {
          userId,
          entryId: entryId || null,
          episodeId: episodeId || null,
        },
      });

      if (existing) {
        return res.status(400).json({
          message: "Já fizeste review",
        });
      }
    }

    // =====================
    // 🔥 CREATE REVIEW
    // =====================
    const review = await Review.create({
      content,
      rating: finalRating,
      type,
      userId,
      entryId: entryId || null,
      episodeId: episodeId || null,
    });

    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEntryReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { sort } = req.query;

    let order = [["createdAt", "DESC"]];

    if (sort === "rating") order = [["rating", "DESC"]];
    if (sort === "popular")
      order = [[{ model: Like, as: "likes" }, "id", "DESC"]];

    // 🔥 episódios da entry
    const episodes = await Episode.findAll({
      where: { entryId: id },
      attributes: ["id"],
    });

    const episodeIds = episodes.map((e) => e.id);

    const reviews = await Review.findAll({
      where: {
        [Op.or]: [{ entryId: id }, { episodeId: episodeIds }],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "avatar"],
        },
        {
          model: Like,
          as: "likes",
          attributes: ["id"],
        },
        {
          model: Episode,
          as: "episode",
          attributes: ["id", "title", "number"],
          include: {
            model: Season,
            as: "season",
            attributes: ["id", "seasonNumber"], // 🔥 importante
          },
        },
      ],
      order,
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEpisodeReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await Review.findAll({
      where: { episodeId: id },
      include: {
        model: User,
        as: "user",
        attributes: ["id", "username", "avatar"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEpisodeReviewCount = async (req, res) => {
  try {
    const { id } = req.params;

    const count = await Review.count({
      where: { episodeId: id },
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEntryReviewCount = async (req, res) => {
  try {
    const { id } = req.params;

    // 🎬 reviews diretas da entry
    const entryReviews = await Review.count({
      where: { entryId: id },
    });

    // 📺 episódios da entry
    const episodes = await Episode.findAll({
      where: { entryId: id },
      attributes: ["id"],
    });

    const episodeIds = episodes.map((e) => e.id);

    // 📊 reviews dos episódios
    const episodeReviews = await Review.count({
      where: { episodeId: episodeIds },
    });

    res.json({
      count: entryReviews + episodeReviews,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ message: "Review não encontrada" });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: "Não autorizado" });
    }

    await review.destroy();

    res.json({ message: "Review removida" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
