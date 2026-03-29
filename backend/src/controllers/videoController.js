import cloudinary from "../utils/cloudinary.js";
import { Video } from "../models/index.js";
import { Readable } from "stream";

export const uploadVideo = async (req, res) => {
  try {
    const { targetType, targetId, title } = req.body;

    if (!req.file?.buffer) return res.status(400).json({ error: "No file" });

    // 🔥 stream upload instead of base64
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "videos",
          resource_type: "video",
          chunk_size: 6000000, // 6MB chunks
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const readable = new Readable();
      readable.push(req.file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });

    const video = await Video.create({
      url: result.secure_url,
      title: title || null,
      targetType,
      targetId,
    });

    res.json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getVideos = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const videos = await Video.findAll({ where: { targetType, targetId } });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const setTrailer = async (req, res) => {
  try {
    const { id } = req.params;
    const { isTrailer } = req.body;

    const video = await Video.findByPk(id);
    if (!video) return res.status(404).json({ message: "Not found" });

    await video.update({ isTrailer });
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByPk(id);
    if (!video) return res.status(404).json({ message: "Not found" });

    const publicId = video.url.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`videos/${publicId}`, {
      resource_type: "video",
    });

    await video.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
