import { Watchlist, Entry } from "../models/index.js";

export const toggleWatchlist = async (req, res) => {
  const { entryId } = req.body;
  const userId = req.user.id;

  const existing = await Watchlist.findOne({
    where: { userId, entryId },
  });

  if (existing) {
    await existing.destroy();

    await Entry.increment(
      { watchlistCount: -1 },
      { where: { id: entryId } }
    );

    return res.json({ added: false });
  }

  await Watchlist.create({ userId, entryId });

  await Entry.increment(
    { watchlistCount: 1 },
    { where: { id: entryId } }
  );

  res.json({ added: true });
};