// controllers/favoriteController.js
import { Favorite } from "../models/index.js";

export const toggleFavorite = async (req, res) => {
  const { entryId } = req.body;
  const userId = req.user.id;

  const existing = await Favorite.findOne({
    where: { userId, entryId },
  });

  if (existing) {
    await existing.destroy();
    return res.json({ added: false });
  }

  await Favorite.create({ userId, entryId });

  res.json({ added: true });
};