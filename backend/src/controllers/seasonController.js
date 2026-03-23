import { Season } from "../models/index.js";

// CREATE
export const createSeason = async (req, res) => {
  try {
    const { entryId } = req.params;

    const season = await Season.create({
      ...req.body,
      entryId,
    });

    res.json(season);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET BY ENTRY
export const getSeasonsByEntry = async (req, res) => {
  try {
    const { entryId } = req.params;

    const seasons = await Season.findAll({
      where: { entryId },
    });

    res.json(seasons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteSeason = async (req, res) => {
  try {
    const { id } = req.params;

    const season = await Season.findByPk(id);

    if (!season) {
      return res.status(404).json({ message: "Season não encontrada" });
    }

    await season.destroy();

    res.json({ message: "Season apagada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};