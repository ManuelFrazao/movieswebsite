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