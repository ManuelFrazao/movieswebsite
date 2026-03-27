import { sequelize, Cast, Character, Actor } from "../models/index.js";

export const addCast = async (req, res) => {
  try {
    const { entryId, characterId, actorId, roleType, order, episodeId } =
      req.body;

    if (!actorId || !characterId) {
      return res.status(400).json({
        message: "actorId and characterId are required",
      });
    }

    const cast = await Cast.create({
      entryId: episodeId ? null : entryId,
      characterId,
      episodeId: episodeId || null,
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
  try {
    const { entryId, episodeId, cast } = req.body;

    if ((!entryId && !episodeId) || !Array.isArray(cast)) {
      return res.status(400).json({ message: "Invalid data" });
    }

    await Cast.destroy({
      where: entryId ? { entryId, episodeId: null } : { episodeId },
    });

    const newCast = await Cast.bulkCreate(
      cast.map((c) => ({
        entryId: entryId || null,
        episodeId: episodeId || null,
        actorId: c.actorId,
        characterId: c.characterId,
        roleType: c.roleType,
        order: c.order,
      })),
    );

    res.json(newCast);
  } catch (err) {
    console.error("FULL ERROR:", err);
    console.error("ERR.NAME:", err.name);
    console.error("ERR.MESSAGE:", err.message);
    console.error("ERR.FIELDS:", err.fields);
    console.error("ERR.ERRORS:", err.errors);

    res.status(500).json({
      error: err.message,
      details: err.errors,
      name: err.name,
    });
  }
};

export const getCharactersByEntry = async (req, res) => {
  const { entryId } = req.params;

  const cast = await Cast.findAll({
    where: { entryId },
    include: [{ model: Character, as: "character" }],
  });

  const characters = cast.map((c) => c.character);

  res.json(characters);
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

export const getEpisodeCast = async (req, res) => {
  try {
    const { episodeId } = req.params;

    const cast = await Cast.findAll({
      where: { episodeId },
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
