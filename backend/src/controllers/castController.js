import { sequelize, Cast, Character, Actor } from "../models/index.js";

// =====================
// ADD SINGLE CAST
// =====================
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
      entryId: entryId,
      episodeId: episodeId || null,
      actorId,
      characterId,
      roleType,
      order,
    });

    res.json(cast);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET ENTRY CAST (BASE ONLY)
// =====================
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

    const uniqueCastMap = new Map();

    cast.forEach((c) => {
      const key = `${c.actorId}-${c.characterId}`;

      if (!uniqueCastMap.has(key) || c.episodeId === null) {
        uniqueCastMap.set(key, c);
      }
    });

    const uniqueCast = Array.from(uniqueCastMap.values());


    res.json(uniqueCast);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET EPISODE CAST
// =====================
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

// =====================
// REPLACE CAST (ENTRY OR EPISODE)
// =====================
export const replaceCast = async (req, res) => {
  try {
    const { entryId, episodeId, cast } = req.body;

    if (!entryId || !Array.isArray(cast)) {
      return res.status(400).json({ message: "entryId is required" });
    }

    // 🔥 REMOVE EXISTING
    await Cast.destroy({
      where: episodeId
        ? { episodeId } // 👉 só este episódio
        : { entryId, episodeId: null }, // 👉 só cast base
    });

    // 🔥 REMOVE DUPLICATES (extra segurança)
    const uniqueCast = cast.filter(
      (c, index, self) =>
        index ===
        self.findIndex(
          (x) => x.actorId === c.actorId && x.characterId === c.characterId,
        ),
    );

    // 🔥 CREATE NEW
    const newCast = await Cast.bulkCreate(
      uniqueCast.map((c) => ({
        entryId: entryId,
        episodeId: episodeId || null,
        actorId: c.actorId,
        characterId: c.characterId,
        roleType: c.roleType,
        order: c.order,
      })),
      { validate: true },
    );

    res.json(newCast);
  } catch (err) {
    console.error("FULL ERROR:", err);
    res.status(500).json({
      error: err.message,
      details: err.errors,
      name: err.name,
    });
  }
};

// =====================
// GET CHARACTERS BY ENTRY
// =====================
export const getCharactersByEntry = async (req, res) => {
  try {
    const { entryId } = req.params;

    const cast = await Cast.findAll({
      where: {
        entryId,
        episodeId: null, // 🔥 só base
      },
      include: [{ model: Character, as: "character" }],
    });

    const characters = cast.map((c) => c.character);

    res.json(characters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// DELETE ENTRY CAST
// =====================
export const deleteCastByEntry = async (req, res) => {
  try {
    const { entryId } = req.params;

    await Cast.destroy({
      where: {
        entryId,
        episodeId: null, // 🔥 só base
      },
    });

    res.json({ message: "Cast cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
