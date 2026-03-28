import { Comment, User } from "../models/index.js";

export const getComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const comments = await Comment.findAll({
      where: { videoId },
      include: [{ model: User, as: "user", attributes: ["id", "username", "avatar"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.create({ content, videoId, userId });

    const full = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: "user", attributes: ["id", "username", "avatar"] }],
    });

    res.json(full);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const user = req.user;

    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ message: "Not found" });

    // only owner or admin can delete
    if (comment.userId !== userId && user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await comment.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};