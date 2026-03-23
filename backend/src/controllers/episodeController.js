import { Episode } from "../models/index.js";
import cloudinary from "../utils/cloudinary.js";

// CREATE
export const createEpisode = async (req, res) => {
  try {
    const { seasonId } = req.params;

    let thumbnail = null;

    if (req.file && req.file.buffer) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "episodes" }
      );

      thumbnail = result.secure_url;
    }

    const episode = await Episode.create({
      ...req.body,
      thumbnail,
      seasonId, // 🔥 ESSENCIAL
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

export const updateEpisode = async (req, res) => {
  try {
    const { id } = req.params;

    const episode = await Episode.findByPk(id);

    if (!episode) {
      return res.status(404).json({ message: "Not found" });
    }

    let thumbnail = episode.thumbnail;

    // 🔥 NOVA IMAGEM
    if (req.file && req.file.buffer) {

      // 🗑️ apagar antiga (ver passo 2 abaixo)
      if (episode.thumbnail) {
        const publicId = episode.thumbnail.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`episodes/${publicId}`);
      }

      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "episodes",
          transformation: [
            { width: 400, crop: "scale" },
            { quality: "auto" }
          ]
        }
      );

      thumbnail = result.secure_url;
    }

    await episode.update({
      ...req.body,
      thumbnail,
    });

    res.json(episode);

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
