import { Favorite, Entry } from "../models/index.js";

export const toggleFavorite = async (req, res) => {
  const { entryId } = req.body;
  const userId = req.user.id;
  const isAdmin = req.user.isAdmin;

  const existing = await Favorite.findOne({
    where: { userId, entryId },
  });

  // 🔥 ADMIN MODE
  if (isAdmin) {
    // opção 1 (toggle infinito controlado)
    if (existing) {
      await existing.destroy();
    }

    await Favorite.create({ userId, entryId });

    const count = await Favorite.count({
      where: { entryId },
    });

    return res.json({
      added: true,
      count,
      adminMode: true,
    });
  }

  // 👇 comportamento normal
  if (existing) {
    await existing.destroy();

    const count = await Favorite.count({
      where: { entryId },
    });

    return res.json({
      added: false,
      count,
    });
  }

  await Favorite.create({ userId, entryId });

  const count = await Favorite.count({
    where: { entryId },
  });

  res.json({
    added: true,
    count,
  });
};