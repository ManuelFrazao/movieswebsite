import { Vote, Entry, Episode } from "../models/index.js";

// 🔥 Creates or updates a user's vote for an entry/episode, then keeps
// Entry.totalVotes/topRank in sync. Shared by voteController (direct rating)
// and reviewController (rating set/changed from inside a review), so the
// entry's overall rating always reflects the latest value either flow wrote.
export const upsertVote = async ({ userId, type, entryId, episodeId, value }) => {
  const existingVote = await Vote.findOne({
    where: {
      userId,
      entryId: entryId || null,
      episodeId: episodeId || null,
    },
  });

  let vote;
  if (existingVote) {
    existingVote.value = value;
    await existingVote.save();
    vote = existingVote;
  } else {
    vote = await Vote.create({
      value,
      type,
      userId,
      entryId: entryId || null,
      episodeId: episodeId || null,
    });
  }

  // 🎬 UPDATE ENTRY STATS (MOVIE)
  if (type === "entry" && entryId) {
    const votes = await Vote.findAll({ where: { entryId } });
    const totalVotes = votes.length;
    const avg =
      totalVotes === 0
        ? 0
        : votes.reduce((sum, v) => sum + v.value, 0) / totalVotes;

    await Entry.update(
      { totalVotes, topRank: Math.round(avg * 10) },
      { where: { id: entryId } },
    );
  }

  // 📺 UPDATE ENTRY STATS (SERIES via episodes)
  if (type === "episode" && episodeId) {
    const episode = await Episode.findByPk(episodeId);

    if (episode?.entryId) {
      const entryIdFromEpisode = episode.entryId;

      const votes = await Vote.findAll({
        include: {
          model: Episode,
          as: "episode",
          where: { entryId: entryIdFromEpisode },
        },
      });

      const totalVotes = votes.length;
      const avg =
        totalVotes === 0
          ? 0
          : votes.reduce((sum, v) => sum + v.value, 0) / totalVotes;

      await Entry.update(
        { totalVotes, topRank: Math.round(avg * 10) },
        { where: { id: entryIdFromEpisode } },
      );
    }
  }

  return vote;
};
