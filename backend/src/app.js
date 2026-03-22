import express from "express";
import { sequelize } from "./config/database.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API a funcionar 🚀");
});

sequelize.authenticate()
  .then(() => console.log("DB conectada 🔥"))
  .catch(err => console.error(err));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});