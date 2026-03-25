import { Cast, Character } from "../models/index.js";

export const addCast = async (req, res) => {
  try {
    const { entryId, characterId, actorName, roleType, order } = req.body;

    const cast = await Cast.create({
      entryId,
      characterId,
      actorName,
      roleType,
      order,
    });

    res.json(cast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEntryCast = async (req, res) => {
  try {
    const { entryId } = req.params;

    const cast = await Cast.findAll({
      where: { entryId },
      include: [
        {
          model: Character,
          as: "Character",
        },
      ],
      order: [["order", "ASC"]],
    });

    res.json(cast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};