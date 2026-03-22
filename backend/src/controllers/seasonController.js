import { Season } from "../models/index.js";

// CREATE
export const createSeason = async (req, res) => {
  try {
    const season = await Season.create(req.body);
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