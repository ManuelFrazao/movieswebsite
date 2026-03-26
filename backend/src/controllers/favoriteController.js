import { Favorite, Entry } from "../models/index.js";

export const toggleFavorite = async (req, res) => {
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

    const existing = await Favorite.findOne({
      where: { userId, entryId },
    });

    if (existing) {
      await existing.destroy();

      await Entry.increment(
        { favoritesCount: -1 },
        { where: { id: entryId } }
      );
    } else {
      await Favorite.create({ userId, entryId });

      await Entry.increment(
        { favoritesCount: 1 },
        { where: { id: entryId } }
      );
    }

    // 🔥 🔥 VALOR REAL DA BD
    const updatedEntry = await Entry.findByPk(entryId);

    return res.json({
      added: !existing,
      count: updatedEntry.favoritesCount,
    });

  } catch (err) {
    console.error("FAVORITE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};