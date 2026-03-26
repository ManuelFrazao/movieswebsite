import { Vote, Entry, Episode } from "../models/index.js";
import { isSpamUser } from "../utils/permissions.js";

export const createVote = async (req, res) => {
  try {
    const { value, type, entryId, episodeId } = req.body;
    const userId = req.user.id;

    if (!value || !type) {
      return res.status(400).json({ message: "Dados inválidos" });
    }

    const spamUser = isSpamUser(req);

    let vote;

    // =====================
    // 👤 USER NORMAL (1 voto → update)
    // =====================
    if (!spamUser) {
      const existing = await Vote.findOne({
        where: {
          userId,
          entryId: entryId || null,
          episodeId: episodeId || null,
        },
      });

      if (existing) {
        await existing.update({ value });
        vote = existing;
      } else {
        vote = await Vote.create({
          value,
          type,
          userId,
          entryId: entryId || null,
          episodeId: episodeId || null,
        });
      }
    }

    // =====================
    // 👑 ADMIN (spam livre)
    // =====================
    else {
      vote = await Vote.create({
        value,
        type,
        userId,
        entryId: entryId || null,
        episodeId: episodeId || null,
      });
    }

    // =====================
    // UPDATE STATS (igual ao teu)
    // =====================

    if (type === "entry" && entryId) {
      const votes = await Vote.findAll({ where: { entryId } });

      const totalVotes = votes.length;
      const avg =
        totalVotes === 0
          ? 0
          : votes.reduce((sum, v) => sum + v.value, 0) / totalVotes;

      await Entry.update(
        {
          totalVotes,
          topRank: Math.round(avg * 10),
        },
        { where: { id: entryId } },
      );
    }

    if (type === "episode" && episodeId) {
      const episode = await Episode.findByPk(episodeId);

      if (episode?.entryId) {
        const votes = await Vote.findAll({
          include: {
            model: Episode,
            as: "episode",
            where: { entryId: episode.entryId },
          },
        });

        const totalVotes = votes.length;
        const avg =
          totalVotes === 0
            ? 0
            : votes.reduce((sum, v) => sum + v.value, 0) / totalVotes;

        await Entry.update(
          {
            totalVotes,
            topRank: Math.round(avg * 10),
          },
          { where: { id: episode.entryId } },
        );
      }
    }

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
// TRENDING (7 dias)
// =====================
export const getEntryTrending = async (req, res) => {
  try {
    const { id } = req.params;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 🔥 buscar entry
    const entry = await Entry.findByPk(id);

    let votes = [];

    if (entry.type === "movie") {
      // 🎬 votos diretos
      votes = await Vote.findAll({
        where: {
          entryId: id,
          createdAt: {
            [Op.gte]: sevenDaysAgo,
          },
        },
      });
    } else {
      // 📺 votos dos episódios
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

    // 🔥 buscar todos os entries com episódios
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

      // 🔥 todos os votos
      let allVotes = [];

      if (entry.type === "movie") {
        // 🎬 votos diretos
        allVotes = await Vote.findAll({
          where: { entryId: entry.id },
        });
      } else {
        // 📺 votos dos episódios
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

      // 🔥 votos recentes
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

    // 🔥 ordenar por score
    results.sort((a, b) => b.score - a.score);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// TRENDING POR EPISÓDIO (7 dias)
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
// TRENDING TODOS OS EPISÓDIOS (7 dias)
// =====================
export const getEntryEpisodesTrending = async (req, res) => {
  try {
    const { id } = req.params;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 🔥 buscar episódios da entry
    const episodes = await Episode.findAll({
      where: { entryId: id },
      attributes: ["id"],
    });

    const episodeIds = episodes.map((ep) => ep.id);

    if (!episodeIds.length) return res.json({});

    // 🔥 buscar votos
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

    // 🔥 calcular médias
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

    // 🔥 inicializar 1–10
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
      // 🎬 votos diretos
      votes = await Vote.findAll({
        where: { entryId: id },
      });
    } else {
      // 📺 votos dos episódios
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

// =====================
// DELETE VOTE
// =====================
export const deleteVote = async (req, res) => {
  try {
    const { id } = req.params;

    const vote = await Vote.findByPk(id);

    if (!vote) {
      return res.status(404).json({ message: "Vote não encontrado" });
    }

    await vote.destroy();

    res.json({ message: "Vote removido" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
