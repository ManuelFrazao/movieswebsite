import { User, Entry } from "../models/index.js";

// 👤 ver todos os users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🎬 ver todos os entries (filmes/séries)
export const getAllEntries = async (req, res) => {
  try {
    const entries = await Entry.findAll();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔄 mudar role de um user
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User não encontrado" });
    }

    user.role = role;
    await user.save();

    res.json({ message: "Role atualizada", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ apagar user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User não encontrado" });
    }

    await user.destroy();

    res.json({ message: "User apagado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};