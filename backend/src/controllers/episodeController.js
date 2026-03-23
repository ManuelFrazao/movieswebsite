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
        { folder: "episodes" },
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

    // 🖼️ upload imagem
    if (req.file && req.file.buffer) {
      if (episode.thumbnail) {
        const publicId = episode.thumbnail.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`episodes/${publicId}`);
      }

      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "episodes",
          transformation: [{ width: 400, crop: "scale" }, { quality: "auto" }],
        },
      );

      thumbnail = result.secure_url;
    }

    const isFinal = req.body?.isFinal === "true" || req.body?.isFinal === true;

    // 🔥 se for final → garantir unicidade
    if (isFinal) {
      const season = await episode.getSeason();
      const entry = await season.getEntry();

      // 🔥 buscar TODAS as seasons da série
      const seasons = await entry.getSeasons();
      const seasonIds = seasons.map((s) => s.id);

      // 🔥 remover qualquer outro episódio final
      await Episode.update(
        { isFinal: false },
        {
          where: {
            seasonId: seasonIds,
          },
        },
      );

      // 🔥 atualizar data de fim da série
      if (req.body.airDate) {
        await entry.update({
          endingYear: new Date(req.body.airDate).getFullYear(),
        });
      }
    }

    await episode.update({
      ...req.body,
      isFinal,
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
