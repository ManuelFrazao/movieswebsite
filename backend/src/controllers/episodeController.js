import {
  Episode,
  Season,
  Entry,
  Favorite,
  Watchlist,
} from "../models/index.js";
import cloudinary from "../utils/cloudinary.js";
import { Op } from "sequelize";

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

    const season = await Season.findByPk(seasonId);

    const episode = await Episode.create({
      ...req.body,
      thumbnail,
      seasonId,
      entryId: season.entryId,
    });

    // 🔥 NOVO: atualizar releaseDate da série
    if (episode.airDate) {
      const allEpisodes = await Episode.findAll({
        where: { entryId: season.entryId },
        attributes: ["airDate"],
      });

      const validDates = allEpisodes
        .map((ep) => ep.airDate)
        .filter(Boolean)
        .map((d) => new Date(d));

      if (validDates.length > 0) {
        const firstDate = new Date(Math.min(...validDates));

        await Entry.update(
          { releaseDate: firstDate },
          { where: { id: season.entryId } },
        );
      }
    }

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
      include: [
        {
          model: Cast,
          as: "cast",
          attributes: ["id"],
        },
      ],
    });

    const formatted = episodes.map((ep) => ({
      ...ep.toJSON(),
      castCount: ep.cast?.length || 0,
    }));

    res.json(formatted);
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

export const getEpisodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const episode = await Episode.findByPk(id, {
      include: [
        {
          model: Season,
          as: "season",
          include: [
            {
              model: Entry,
              as: "entry",
            },
          ],
        },
      ],
    });

    if (!episode) {
      return res.status(404).json({ message: "Not found" });
    }

    // =====================
    // 🔥 USER FLAGS
    // =====================
    let isFavorite = false;
    let isWatchlist = false;

    if (userId) {
      const [fav, watch] = await Promise.all([
        Favorite.findOne({
          where: {
            userId,
            targetId: id,
            targetType: "episode",
          },
        }),
        Watchlist.findOne({
          where: {
            userId,
            targetId: id,
            targetType: "episode",
          },
        }),
      ]);

      isFavorite = !!fav;
      isWatchlist = !!watch;
    }

    // =====================
    // 🔥 COUNTS
    // =====================
    const [favoritesCount, watchlistCount] = await Promise.all([
      Favorite.count({
        where: {
          targetId: id,
          targetType: "episode",
        },
      }),
      Watchlist.count({
        where: {
          targetId: id,
          targetType: "episode",
        },
      }),
    ]);

    // =====================
    // 🔥 RESPONSE FINAL
    // =====================
    res.json({
      ...episode.toJSON(),
      isFavorite,
      isWatchlist,
      favoritesCount,
      watchlistCount,
    });
  } catch (err) {
    console.error(err);
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
