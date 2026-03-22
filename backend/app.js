const { sequelize } = require("./config/database");

sequelize.authenticate()
  .then(() => console.log("DB conectada 🔥"))
  .catch(err => console.error("Erro DB:", err));