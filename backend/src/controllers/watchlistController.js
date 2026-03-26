import { Watchlist, Entry } from "../models/index.js";

export const toggleWatchlist = async (req, res) => {
  const { entryId } = req.body;
  const userId = req.user.id;
  const isAdmin = req.user.isAdmin; // 👈 AQUI

  const existing = await Watchlist.findOne({
    where: { userId, entryId },
  });

  // 🔥 ADMIN MODE → permite sempre criar (sem bloquear)
  if (isAdmin) {
    if (existing) {
      await existing.destroy();
    }

    await Watchlist.create({ userId, entryId });

    const count = await Watchlist.count({ where: { entryId } });

    return res.json({
      added: true,
      count,
      adminMode: true,
    });
  }

  // 👇 comportamento normal
  if (existing) {
    await existing.destroy();

    const count = await Watchlist.count({ where: { entryId } });

    return res.json({ added: false, count });
  }

  await Watchlist.create({ userId, entryId });

  const count = await Watchlist.count({ where: { entryId } });

  res.json({ added: true, count });
};