import { Favorite, Entry } from "../models/index.js";

export const toggleFavorite = async (req, res) => {
  const { targetId, targetType } = req.body;
  const userId = req.user.id;
  const isAdmin = req.user.role === "admin";

  // 🔥 ADMIN MODE → SEMPRE ADICIONA
  if (isAdmin) {
    await Favorite.create({ userId, targetId });

    const count = await Favorite.count({ where: { targetId } });

    return res.json({
      added: true,
      count,
      adminMode: true,
    });
  }

  // 👇 normal
  const existing = await Favorite.findOne({
    where: { userId, targetId, targetType },
  });

  if (existing) {
    await existing.destroy();

    const count = await Favorite.count({
      where: { targetId, targetType },
    });

    return res.json({ added: false, count });
  }

  await Favorite.create({ userId, targetId, targetType });

  const count = await Favorite.count({
    where: { targetId, targetType },
  });

  res.json({ added: true, count });
};
