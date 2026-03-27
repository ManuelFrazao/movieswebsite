// controllers/characterAliasController.js

import { CharacterAlias } from "../models/index.js";

export const addAlias = async (req, res) => {
  try {
    const { characterId, name, startSeason, endSeason } = req.body;

    if (!characterId || !name) {
      return res.status(400).json({ message: "Missing data" });
    }

    const alias = await CharacterAlias.create({
      characterId,
      name,
      startSeason,
      endSeason,
    });

    res.json(alias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const bulkCharacterAlias = async (req, res) => {
  try {
    const { characterId, aliases } = req.body;

    if (!characterId || !Array.isArray(aliases)) {
      return res.status(400).json({ message: "Invalid data" });
    }

    // 🔥 apagar antigos
    await CharacterAlias.destroy({
      where: { characterId },
    });

    // 🔥 criar novos
    const newAliases = await CharacterAlias.bulkCreate(
      aliases.map((a) => ({
        characterId,
        name: a.name,
        startSeason: a.startSeason || null,
        endSeason: a.endSeason || null,
      }))
    );

    res.json(newAliases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};