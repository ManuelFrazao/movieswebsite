import { sequelize, Cast, Character, Actor } from "../models/index.js";

export const addCast = async (req, res) => {
  try {
    const { entryId, characterId, actorId, roleType, order } = req.body;

    if (!actorId || !characterId) {
      return res.status(400).json({
        message: "actorId and characterId are required",
      });
    }

    const cast = await Cast.create({
      entryId,
      characterId,
      actorId,
      roleType,
      order,
    });

    res.json(cast);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getEntryCast = async (req, res) => {
  try {
    const { entryId } = req.params;

    const cast = await Cast.findAll({
      where: { entryId },
      include: [
        { model: Actor, as: "actor" },
        { model: Character, as: "character" },
      ],
      order: [["order", "ASC"]],
    });

    res.json(cast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const replaceCast = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { entryId, cast } = req.body;

    if (!entryId || !Array.isArray(cast)) {
      return res.status(400).json({ message: "Invalid data" });
    }

    // 🔥 delete old
    await Cast.destroy({
      where: { entryId },
      transaction: t,
    });

    // 🔥 insert new
    const newCast = [];

    for (const c of cast) {
      const created = await Cast.create(
        {
          entryId,
          actorId: c.actorId,
          characterId: c.characterId,
          roleType: c.roleType,
          order: c.order,
        },
        { transaction: t },
      );

      newCast.push(created);
    }

    await t.commit();

    res.json(newCast);
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteCastByEntry = async (req, res) => {
  try {
    const { entryId } = req.params;

    await Cast.destroy({
      where: { entryId },
    });

    res.json({ message: "Cast cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
