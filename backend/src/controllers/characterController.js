import { Character, CharacterAlias, Favorite, Cast, Actor, Entry } from "../models/index.js";
import { Op } from "sequelize";
import cloudinary from "../utils/cloudinary.js";

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

    const existing = await Character.findOne({
      where: {
        name: {
          [Op.iLike]: name,
        },
      },
    });

    if (existing) return res.json(existing);

    let imageUrl = null;

    if (req.file && req.file.buffer) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "characters" },
      );

      imageUrl = result.secure_url;
    }

    const slug = generateSlug(name);

    const character = await Character.create({
      name,
      slug,
      image: imageUrl,
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
          model: Cast,
          as: "castRoles",
          include: [
            { model: Actor, as: "actor" },
            { model: Entry, as: "entry" },
          ],
        },
      ],
      order: [[{ model: CharacterAlias, as: "aliases" }, "startSeason", "ASC"]],
    });

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    const favoritesCount = await Favorite.count({
      where: { targetId: character.id, targetType: "character" },
    });

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

    let imageUrl = character.image;

    // 🔥 upload imagem (igual ao episode)
    if (req.file && req.file.buffer) {
      // apagar antiga (opcional mas recomendado)
      if (character.image) {
        const publicId = character.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`characters/${publicId}`);
      }

      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "characters",
          transformation: [{ width: 400, crop: "scale" }, { quality: "auto" }],
        },
      );

      imageUrl = result.secure_url;
    }

    let slug = character.slug;
    if (req.body.name && req.body.name !== character.name) {
      slug = generateSlug(req.body.name);
    }

    await character.update({
      ...req.body,
      slug,
      image: imageUrl,
    });

    res.json(character);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
