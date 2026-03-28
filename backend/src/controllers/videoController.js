import cloudinary from "../utils/cloudinary.js";
import { Video } from "../models/index.js";

export const uploadVideo = async (req, res) => {
  try {
    const { targetType, targetId, title } = req.body;

    if (!req.file?.buffer) return res.status(400).json({ error: "No file" });

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      {
        folder: "videos",
        resource_type: "video",
        transformation: [{ quality: "auto" }],
      },
    );

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
