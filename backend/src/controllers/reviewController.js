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
import { upsertVote } from "../utils/voteHelpers.js";

// =====================
// CREATE REVIEW
// =====================
export const createReview = async (req, res) => {
  try {
    const { content, type, entryId, episodeId, rating: inputRating } = req.body;
    const userId = req.user.id;

    let finalRating = null;

    // ENTRY
    if (type === "entry") {
      const entry = await Entry.findByPk(entryId);

      if (!entry) {
        return res.status(404).json({ message: "Entry não encontrada" });
      }

      // rating is provided in the request body, use it and update the Vote for the entry
      if (inputRating) {
        finalRating = inputRating;

        // mantains the Vote of the entry (and the overall rating) in sync with the rating chosen in the review
        if (entry.type !== "series") {
          await upsertVote({
            userId,
            type: "entry",
            entryId,
            value: finalRating,
          });
        }
      }

      // MOVIE (fallback to vote)
      else if (entry.type !== "series") {
        const vote = await Vote.findOne({
          where: { userId, entryId },
        });

        if (!vote) {
          return res.status(400).json({
            message: "Tens de avaliar o filme antes de fazer review",
          });
        }

        finalRating = vote.value;
      }

      // SERIES (fallback media of episode votes)
      else {
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

    // EPISODE
    if (type === "episode") {
      if (inputRating) {
        finalRating = inputRating;

        // mantains the Vote of the episode (and the overall rating of the entry) in sync with the rating chosen in the review
        await upsertVote({
          userId,
          type: "episode",
          episodeId,
          value: finalRating,
        });
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

    // if the user has already reviewed this entry or episode, update the existing review instead of creating a new one
    const existingReview = await Review.findOne({
      where: {
        userId,
        entryId: entryId || null,
        episodeId: episodeId || null,
      },
    });

    let review;
    if (existingReview) {
      existingReview.content = content;
      existingReview.rating = finalRating;
      await existingReview.save();
      review = existingReview;
    } else {
      review = await Review.create({
        content,
        rating: finalRating,
        type,
        userId,
        entryId: entryId || null,
        episodeId: episodeId || null,
      });
    }

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

    // entry episodes
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
            attributes: ["id", "seasonNumber"],
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

    // entry reviews
    const entryReviews = await Review.count({
      where: { entryId: id },
    });

    // entry episodes
    const episodes = await Episode.findAll({
      where: { entryId: id },
      attributes: ["id"],
    });

    const episodeIds = episodes.map((e) => e.id);

    // episode reviews
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
