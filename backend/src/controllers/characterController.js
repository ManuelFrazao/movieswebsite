import { Character, CharacterAlias, Favorite } from "../models/index.js";
import { Op } from "sequelize";

const generateSlug = (name) => {
  return (
    name
      .toLowerCase()
      .replace(/ /g, "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now()
  );
};

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

    // 🔥 gerar slug
    const slug = generateSlug(name);

    // ✅ CREATE NEW
    const character = await Character.create({
      name,
      slug,
    });

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

export const getCharacterById = async (req, res) => {
  try {
    const { id } = req.params;

    const character = await Character.findByPk(id, {
      include: [
        {
          model: CharacterAlias,
          as: "aliases",
        },
      ],
      order: [[{ model: CharacterAlias, as: "aliases" }, "startSeason", "ASC"]],
    });

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    res.json(character);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getCharacterBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const character = await Character.findOne({
      where: { slug },
      include: [
        {
          model: CharacterAlias,
          as: "aliases",
        },
        {
          association: "castRoles",
          include: ["actor", "entry"],
        },
      ],
      order: [[{ model: CharacterAlias, as: "aliases" }, "startSeason", "ASC"]],
    });

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    // 🔥 contar favoritos
    const favoritesCount = await Favorite.count({
      where: {
        targetId: character.id,
        targetType: "character",
      },
    });

    // 🔥 adicionar ao objeto
    character.dataValues.favoritesCount = favoritesCount;

    res.json(character);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateCharacter = async (req, res) => {
  try {
    const { id } = req.params;

    const character = await Character.findByPk(id);

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    const { name, description } = req.body;

    // 🔥 atualizar campos
    if (name) character.name = name;
    if (description) character.description = description;

    // 🔥 imagem (se existir)
    if (req.file) {
      character.image = req.file.path;
    }

    await character.save();

    res.json(character);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
