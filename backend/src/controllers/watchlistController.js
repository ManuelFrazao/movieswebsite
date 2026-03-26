// controllers/watchlistController.js
import { Watchlist } from "../models/index.js";

export const toggleWatchlist = async (req, res) => {
  const { entryId, episodeId } = req.body;
  const userId = req.user.id;

  try {
    const existing = await Watchlist.findOne({
      where: { userId, entryId, episodeId },
    });

    if (existing) {
      await existing.destroy();
      return res.json({ added: false });
    }

    await Watchlist.create({ userId, entryId, episodeId });

    res.json({ added: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};