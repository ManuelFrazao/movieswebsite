import { Character } from "../models/index.js";
import { Op } from "sequelize";

// CREATE
export const createCharacter = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // 🔥 CHECK IF EXISTS FIRST
    const existing = await Character.findOne({
      where: {
        name: {
          [Op.iLike]: name,
        },
      },
    });

    if (existing) {
      return res.json(existing); // ✅ return existing instead of creating duplicate
    }

    // ✅ CREATE NEW
    const character = await Character.create({ name });

    res.json(character);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// SEARCH
export const searchCharacters = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) return res.json([]);

    const characters = await Character.findAll({
      where: {
        name: {
          [Op.iLike]: `%${q}%`,
        },
      },
      limit: 20,
      order: [["name", "ASC"]],
    });

    res.json(characters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
