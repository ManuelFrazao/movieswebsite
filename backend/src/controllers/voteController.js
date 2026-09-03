import { Vote, Entry, Episode, Review } from "../models/index.js";
import { Op } from "sequelize";
import { upsertVote } from "../utils/voteHelpers.js";

// =====================
// CREATE VOTE
// =====================
export const createVote = async (req, res) => {
  try {
    const { value, type, entryId, episodeId } = req.body;
    const userId = req.user.id;

    if (!value || !type) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const vote = await upsertVote({ userId, type, entryId, episodeId, value });

    res.json(vote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET EPISODE STATS
// =====================
export const getEpisodeStats = async (req, res) => {
  try {
    const { id } = req.params;

    const votes = await Vote.findAll({
      where: { episodeId: id },
    });

    const totalVotes = votes.length;

    const avg =
      totalVotes === 0
        ? 0
        : votes.reduce((sum, v) => sum + v.value, 0) / totalVotes;

    res.json({
      totalVotes,
      averageRating: avg.toFixed(1),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET ENTRY STATS
// =====================
export const getEntryStats = async (req, res) => {
  try {
    const { id } = req.params;

    const votes = await Vote.findAll({
      where: { entryId: id },
    });

    const totalVotes = votes.length;

    const avg =
      totalVotes === 0
        ? 0
        : votes.reduce((sum, v) => sum + v.value, 0) / totalVotes;

    res.json({
      totalVotes,
      averageRating: avg.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// TRENDING (7 days)
// =====================
export const getEntryTrending = async (req, res) => {
  try {
    const { id } = req.params;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // get entry
    const entry = await Entry.findByPk(id);

    let votes = [];

    if (entry.type === "movie") {
      // direct votes for the entry
      votes = await Vote.findAll({
        where: {
          entryId: id,
          createdAt: {
            [Op.gte]: sevenDaysAgo,
          },
        },
      });
    } else {
      // episode votes for the entry
      votes = await Vote.findAll({
        include: {
          model: Episode,
          as: "episode",
          where: { entryId: id },
        },
        where: {
          createdAt: {
            [Op.gte]: sevenDaysAgo,
          },
        },
      });
    }

    const grouped = {};

    votes.forEach((vote) => {
      const day = vote.createdAt.toISOString().split("T")[0];

      if (!grouped[day]) {
        grouped[day] = {
          count: 0,
          total: 0,
        };
      }

      grouped[day].count += 1;
      grouped[day].total += vote.value;
    });

    const result = {};

    Object.keys(grouped).forEach((day) => {
      result[day] = {
        count: grouped[day].count,
        avg: grouped[day].total / grouped[day].count,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTrendingEntries = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // get all entries with episodes
    const entries = await Entry.findAll({
      include: {
        model: Episode,
        as: "episodes",
        attributes: ["id"],
      },
    });

    const results = [];

    for (const entry of entries) {
      const episodeIds = entry.episodes.map((ep) => ep.id);

      if (!episodeIds.length && entry.type !== "movie") {
        results.push({
          ...entry.toJSON(),
          score: 0,
          totalVotes: 0,
          avg: 0,
          recentVotes: 0,
        });
        continue;
      }

      // get all votes
      let allVotes = [];

      if (entry.type === "movie") {
        // direct votes
        allVotes = await Vote.findAll({
          where: { entryId: entry.id },
        });
      } else {
        // episode votes
        allVotes = await Vote.findAll({
          where: {
            episodeId: {
              [Op.in]: episodeIds,
            },
          },
        });
      }

      const totalVotes = allVotes.length;

      const avg =
        totalVotes === 0
          ? 0
          : allVotes.reduce((sum, v) => sum + v.value, 0) / totalVotes;

      // recent votes
      let recentVotes = 0;

      if (entry.type === "movie") {
        recentVotes = await Vote.count({
          where: {
            entryId: entry.id,
            createdAt: {
              [Op.gte]: sevenDaysAgo,
            },
          },
        });
      } else {
        recentVotes = await Vote.count({
          where: {
            episodeId: {
              [Op.in]: episodeIds,
            },
            createdAt: {
              [Op.gte]: sevenDaysAgo,
            },
          },
        });
      }

      const trendingBoost = recentVotes * 2;

      const score = avg * Math.log10(totalVotes + 1) + trendingBoost;

      results.push({
        ...entry.toJSON(),
        score,
        totalVotes,
        avg: avg.toFixed(1),
        recentVotes,
      });
    }

    // order by score
    results.sort((a, b) => b.score - a.score);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// TRENDING POR EPISÓDIO (7 days)
// =====================
export const getEpisodeTrending = async (req, res) => {
  try {
    const { id } = req.params;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const votes = await Vote.findAll({
      where: {
        episodeId: id,
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
    });

    const grouped = {};

    votes.forEach((vote) => {
      const day = vote.createdAt.toISOString().split("T")[0];

      if (!grouped[day]) {
        grouped[day] = {
          count: 0,
          total: 0,
        };
      }

      grouped[day].count += 1;
      grouped[day].total += vote.value;
    });

    const result = {};

    Object.keys(grouped).forEach((day) => {
      result[day] = {
        count: grouped[day].count,
        avg: grouped[day].total / grouped[day].count,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// Episode Trend (7 days)
// =====================
export const getEntryEpisodesTrending = async (req, res) => {
  try {
    const { id } = req.params;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // get entry episodes
    const episodes = await Episode.findAll({
      where: { entryId: id },
      attributes: ["id"],
    });

    const episodeIds = episodes.map((ep) => ep.id);

    if (!episodeIds.length) return res.json({});

    // get votes for the episodes in the last 7 days
    const votes = await Vote.findAll({
      where: {
        episodeId: {
          [Op.in]: episodeIds,
        },
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
    });

    const result = {};

    votes.forEach((vote) => {
      const day = vote.createdAt.toISOString().split("T")[0];
      const epId = vote.episodeId;

      if (!result[epId]) result[epId] = {};
      if (!result[epId][day]) {
        result[epId][day] = { count: 0, total: 0 };
      }

      result[epId][day].count += 1;
      result[epId][day].total += vote.value;
    });

    // calculate average for each day
    Object.keys(result).forEach((epId) => {
      Object.keys(result[epId]).forEach((day) => {
        const d = result[epId][day];
        result[epId][day] = {
          count: d.count,
          avg: d.total / d.count,
        };
      });
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEpisodeDistribution = async (req, res) => {
  try {
    const { id } = req.params;

    const votes = await Vote.findAll({
      where: { episodeId: id },
    });

    const distribution = {};

    // initialize distribution for values 1-10
    for (let i = 1; i <= 10; i++) {
      distribution[i] = 0;
    }

    votes.forEach((vote) => {
      distribution[vote.value] += 1;
    });

    res.json(distribution);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEntryDistribution = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await Entry.findByPk(id);

    let votes = [];

    if (entry.type === "movie") {
      // direct votes for the entry
      votes = await Vote.findAll({
        where: { entryId: id },
      });
    } else {
      // epidode votes for the entry
      votes = await Vote.findAll({
        include: {
          model: Episode,
          as: "episode",
          where: { entryId: id },
        },
      });
    }

    const distribution = {};

    for (let i = 1; i <= 10; i++) {
      distribution[i] = 0;
    }

    votes.forEach((v) => {
      distribution[v.value] += 1;
    });

    res.json(distribution);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyVotes = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;

    const episodes = await Episode.findAll({
      where: { entryId },
      attributes: ["id"],
    });
    const episodeIds = episodes.map((e) => e.id);

    const votes = await Vote.findAll({
      where: {
        userId,
        [Op.or]: [
          { entryId },
          { episodeId: episodeIds },
        ],
      },
    });

    res.json(votes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// DELETE VOTE
// =====================
export const deleteVote = async (req, res) => {
  try {
    const { id } = req.params;

    const vote = await Vote.findByPk(id);

    if (!vote) {
      return res.status(404).json({ message: "Vote not found" });
    }

    await vote.destroy();

    res.json({ message: "Vote removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};