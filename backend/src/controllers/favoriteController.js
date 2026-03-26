import { Favorite, Entry } from "../models/index.js";

export const toggleFavorite = async (req, res) => {
  const { entryId } = req.body;
  const userId = req.user.id;
  const isAdmin = req.user.role === "admin";

  // 🔥 ADMIN MODE → SEMPRE ADICIONA
  if (isAdmin) {
    await Favorite.create({ userId, entryId });

    const count = await Favorite.count({ where: { entryId } });

    return res.json({
      added: true,
      count,
      adminMode: true,
    });
  }

  // 👇 normal
  const existing = await Favorite.findOne({
    where: { userId, entryId },
  });

  if (existing) {
    await existing.destroy();

    const count = await Favorite.count({ where: { entryId } });

    return res.json({ added: false, count });
  }

  await Favorite.create({ userId, entryId });

  const count = await Favorite.count({ where: { entryId } });

  res.json({ added: true, count });
};
