import cloudinary from "../utils/cloudinary.js";
import { Entry, Season, Episode } from "../models/index.js";

const generateSlug = (title) => {
  return (
    title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "") +
    "-" +
    Date.now()
  );
};

// CREATE ENTRY
export const createEntry = async (req, res) => {
  try {
    let imageUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "entries" }
      );

      imageUrl = result.secure_url;
    }

    const slug = generateSlug(req.body.title); // 🔥 aqui

    const entry = await Entry.create({
      ...req.body,
      slug,
      coverImage: imageUrl,
    });

    res.json(entry);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
export const getEntries = async (req, res) => {
  try {
    const entries = await Entry.findAll();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONE (FULL DATA 🔥)
export const getEntryById = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await Entry.findByPk(id, {
      include: [
        {
          model: Season,
          as: "seasons",
          include: [
            {
              model: Episode,
              as: "episodes",
            },
          ],
        },
      ],
    });

    if (!entry) {
      return res.status(404).json({ message: "Entry não encontrada" });
    }

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
export const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await Entry.findByPk(id);

    if (!entry) {
      return res.status(404).json({ message: "Entry não encontrada" });
    }

    await entry.destroy();

    res.json({ message: "Entry apagada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};