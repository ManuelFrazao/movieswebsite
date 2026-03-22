import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { sequelize } from "./models/index.js";
import routes from "./routes/index.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API a funcionar 🚀");
});

app.use("/api", routes);

// ligar à DB
sequelize.authenticate()
  .then(() => console.log("DB conectada 🔥"))
  .catch(err => console.error(err));

// 🔥 CRIAR TABELAS
sequelize.sync({ alter: true })
  .then(() => console.log("Tabelas criadas ✅"))
  .catch(err => console.error(err));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});