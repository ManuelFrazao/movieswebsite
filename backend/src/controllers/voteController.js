import { Vote, Entry, Episode } from "../models/index.js";
import { Op } from "sequelize";

// =====================
// CREATE VOTE
// =====================
export const createVote = async (req, res) => {
  try {
    const { value, type, entryId, episodeId } = req.body;
    const userId = req.user.id;

    // validação
    if (!value || !type) {
      return res.status(400).json({ message: "Dados inválidos" });
    }

    if (type === "entry" && !entryId) {
      return res.status(400).json({ message: "entryId necessário" });
    }

    if (type === "episode" && !episodeId) {
      return res.status(400).json({ message: "episodeId necessário" });
    }

    const vote = await Vote.create({
      value,
      type,
      userId,
      entryId: entryId || null,
      episodeId: episodeId || null,
    });

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

    const votes = await Vote.findAll({
      where: {
        entryId: id,
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
    });

    // agrupar por dia
    const grouped = {};

    votes.forEach((vote) => {
      const day = vote.createdAt.toISOString().split("T")[0];

      if (!grouped[day]) grouped[day] = 0;
      grouped[day]++;
    });

    res.json(grouped);
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
