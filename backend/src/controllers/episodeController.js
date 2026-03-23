import { Episode } from "../models/index.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

// CREATE
export const createEpisode = async (req, res) => {
  try {
    let thumbnail = null;

    // 🔥 upload imagem
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      thumbnail = result.secure_url;

      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.log("File cleanup error:", err);
      }
    }

    const episode = await Episode.create({
      ...req.body,
      thumbnail,
    });

    res.json(episode);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET BY SEASON
export const getEpisodesBySeason = async (req, res) => {
  try {
    const { seasonId } = req.params;

    const episodes = await Episode.findAll({
      where: { seasonId },
    });

    res.json(episodes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteEpisode = async (req, res) => {
  try {
    const { id } = req.params;

    const episode = await Episode.findByPk(id);

    if (!episode) {
      return res.status(404).json({ message: "Episode não encontrado" });
    }

    await episode.destroy();

    res.json({ message: "Episode apagado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
