import cloudinary from "../utils/cloudinary.js";
import { Actor, Favorite } from "../models/index.js";
import { Op, Sequelize, fn, col, where } from "sequelize";

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

export const createActor = async (req, res) => {
  try {
    let imageUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "actors" }, // 👈 different folder
      );

      imageUrl = result.secure_url;
    }

    const slug = generateSlug(req.body.name);

    const actor = await Actor.create({
      ...req.body,
      slug,
      profileImage: imageUrl,
    });

    res.json(actor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getActors = async (req, res) => {
  try {
    const actors = await Actor.findAll();
    res.json(actors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getActorBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const actor = await Actor.findOne({
      where: { slug },
      include: [
        {
          association: "roles",
          include: ["character", "entry"],
        },
      ],
    });

    if (!actor) {
      return res.status(404).json({ message: "Actor not found" });
    }

    // 🔥 contar favoritos
    const favoritesCount = await Favorite.count({
      where: {
        targetId: actor.id,
        targetType: "actor",
      },
    });

    // 🔥 adicionar ao objeto
    actor.dataValues.favoritesCount = favoritesCount;

    res.json(actor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateActor = async (req, res) => {
  try {
    const { id } = req.params;

    const actor = await Actor.findByPk(id);

    if (!actor) {
      return res.status(404).json({ message: "Actor not found" });
    }

    let imageUrl = actor.profileImage;

    if (req.file && req.file.buffer) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "actors" },
      );

      imageUrl = result.secure_url;
    }

    let slug = actor.slug;
    if (req.body.name && req.body.name !== actor.name) {
      slug = generateSlug(req.body.name);
    }

    await actor.update({
      ...req.body,
      slug,
      profileImage: imageUrl,
    });

    res.json(actor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchActors = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) return res.json([]);

    const terms = q.trim().split(/\s+/).filter(Boolean);

    const actors = await Actor.findAll({
      where: {
        [Op.and]: terms.map((term) =>
          where(fn("LOWER", col("name")), {
            [Op.like]: `%${term.toLowerCase()}%`,
          }),
        ),
      },
      limit: 20,
      order: [["name", "ASC"]],
    });

    res.json(actors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
