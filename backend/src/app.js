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
  res.send("API is working");
});

app.use("/api", routes);

// connect to the database
sequelize.authenticate()
  .then(() => console.log("Data base connected"))
  .catch(err => console.error(err));

app.listen(PORT, () => {
  console.log(`Server open on port ${PORT}`);
});