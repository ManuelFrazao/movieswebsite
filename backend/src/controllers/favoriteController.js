import { Favorite, Entry } from "../models/index.js";

export const toggleFavorite = async (req, res) => {
  const { entryId } = req.body;
  const userId = req.user.id;

  const existing = await Favorite.findOne({
    where: { userId, entryId },
  });

  if (existing) {
    await existing.destroy();

    await Entry.increment({ favoritesCount: -1 }, { where: { id: entryId } });

    return res.json({ added: false });
  }

  await Favorite.create({ userId, entryId });

  await Entry.increment({ favoritesCount: 1 }, { where: { id: entryId } });

  res.json({ added: true });
};
