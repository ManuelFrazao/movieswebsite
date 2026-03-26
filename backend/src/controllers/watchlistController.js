import { Watchlist, Entry } from "../models/index.js";

export const toggleWatchlist = async (req, res) => {
  const { targetId, targetType } = req.body;
  const userId = req.user.id;
  const isAdmin = req.user.role === "admin";

  if (isAdmin) {
    await Watchlist.create({ userId, targetId, targetType });

    const count = await Watchlist.count({
      where: { targetId, targetType },
    });

    return res.json({ added: true, count, adminMode: true });
  }

  const existing = await Watchlist.findOne({
    where: { userId, targetId, targetType },
  });

  if (existing) {
    await existing.destroy();

    const count = await Watchlist.count({
      where: { targetId, targetType },
    });

    return res.json({ added: false, count });
  }

  await Watchlist.create({ userId, targetId, targetType });

  const count = await Watchlist.count({
    where: { targetId, targetType },
  });

  res.json({ added: true, count });
};