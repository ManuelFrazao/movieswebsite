import cloudinary from "../utils/cloudinary.js";
import { Image } from "../models/index.js";

export const uploadImage = async (req, res) => {
  try {
    const { targetType, targetId } = req.body;

    if (!req.file?.buffer) return res.status(400).json({ error: "No file" });

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      { folder: "gallery" }
    );

    const image = await Image.create({
      url: result.secure_url,
      caption: req.body.caption || null,
      targetType,
      targetId,
    });

    res.json(image);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getImages = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const images = await Image.findAll({ where: { targetType, targetId } });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findByPk(id);
    if (!image) return res.status(404).json({ message: "Not found" });

    // Delete from Cloudinary
    const publicId = image.url.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`gallery/${publicId}`);

    await image.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};