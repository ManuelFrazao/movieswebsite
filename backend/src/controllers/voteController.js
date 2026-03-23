import { Vote, Entry, Episode } from "../models/index.js";
import { Op } from "sequelize";

// =====================
// CREATE VOTE
// =====================
export const createVote = async (req, res) => {
  try {
    const { value, type, entryId, episodeId } = req.body;
    const userId = req.user.id;

    if (!value || !type) {
      return res.status(400).json({ message: "Dados inválidos" });
    }

    // 🔥 criar voto PRIMEIRO
    const vote = await Vote.create({
      value,
      type,
      userId,
      entryId: entryId || null,
      episodeId: episodeId || null,
    });

    // 🔥 se for episódio → atualizar entry
    if (type === "episode" && episodeId) {
      const episode = await Episode.findByPk(episodeId);

      if (episode?.entryId) {
        const entryId = episode.entryId;

        // 🔥 TODOS os votos dos episódios desta entry
        const votes = await Vote.findAll({
          include: {
            model: Episode,
            as: "episode",
            where: { entryId },
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
          { where: { id: entryId } },
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

    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    );

    const votes = await Vote.findAll({
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

    // 🔥 agrupar por dia
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

    // 🔥 calcular média por dia
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

      if (!episodeIds.length) {
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
      const allVotes = await Vote.findAll({
        where: {
          episodeId: {
            [Op.in]: episodeIds,
          },
        },
      });

      const totalVotes = allVotes.length;

      const avg =
        totalVotes === 0
          ? 0
          : allVotes.reduce((sum, v) => sum + v.value, 0) / totalVotes;

      // 🔥 votos recentes
      const recentVotes = await Vote.count({
        where: {
          episodeId: {
            [Op.in]: episodeIds,
          },
          createdAt: {
            [Op.gte]: sevenDaysAgo,
          },
        },
      });

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
