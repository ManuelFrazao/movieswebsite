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
