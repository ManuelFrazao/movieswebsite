import { Favorite, Entry } from "../models/index.js";
import { Op } from "sequelize";

export const toggleFavorite = async (req, res) => {
  const { targetId, targetType } = req.body;
  const userId = req.user.id;
  const isAdmin = req.user.role === "admin";

  // 🔥 ADMIN MODE → SEMPRE ADICIONA
  if (isAdmin) {
    await Favorite.create({ userId, targetId, targetType });

    const count = await Favorite.count({
      where: { targetId, targetType },
    });

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

export const getActorFavoritesTrending = async (req, res) => {
  try {
    const { id } = req.params;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const favorites = await Favorite.findAll({
      where: {
        targetId: id,
        targetType: "actor",
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
    });

    const grouped = {};

    favorites.forEach((fav) => {
      const day = fav.createdAt.toISOString().split("T")[0];

      if (!grouped[day]) {
        grouped[day] = { count: 0 };
      }

      grouped[day].count += 1;
    });

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCharacterFavoritesTrending = async (req, res) => {
  try {
    const { id } = req.params;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const favorites = await Favorite.findAll({
      where: {
        targetId: id,
        targetType: "character",
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
    });

    const grouped = {};

    favorites.forEach((fav) => {
      const day = fav.createdAt.toISOString().split("T")[0];

      if (!grouped[day]) grouped[day] = { count: 0 };

      grouped[day].count += 1;
    });

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
