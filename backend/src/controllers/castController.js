import { Cast, Character, Actor } from "../models/index.js";

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
