import { Watchlist, Entry } from "../models/index.js";

export const toggleWatchlist = async (req, res) => {
  try {
    const { entryId } = req.body;
    const userId = req.user.id;

    if (!entryId) {
      return res.status(400).json({ message: "Missing entryId" });
    }

    const entry = await Entry.findByPk(entryId);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const existing = await Watchlist.findOne({
      where: { userId, entryId },
    });

    if (existing) {
      await existing.destroy();

      await Entry.increment(
        { watchlistCount: -1 },
        { where: { id: entryId } }
      );
    } else {
      await Watchlist.create({ userId, entryId });

      await Entry.increment(
        { watchlistCount: 1 },
        { where: { id: entryId } }
      );
    }

    // 🔥 🔥 VALOR REAL DA BD
    const updatedEntry = await Entry.findByPk(entryId);

    return res.json({
      added: !existing,
      count: updatedEntry.watchlistCount,
    });

  } catch (err) {
    console.error("WATCHLIST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};