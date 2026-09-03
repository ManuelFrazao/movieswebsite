// Config file for sequelize-cli only (the migration tool). This is separate
// from database.js, which is what your actual app uses at runtime — the CLI
// can't load an ESM file with `import`/`new Sequelize(...)` logic in it, so
// it gets this small standalone .cjs file instead. Both ultimately point at
// the same database via DATABASE_URL.
require("dotenv").config();

const shared = {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
};

module.exports = {
  development: {
    ...shared,
    use_env_variable: "DATABASE_URL",
  },
  test: {
    ...shared,
    use_env_variable: "DATABASE_URL",
  },
  production: {
    ...shared,
    use_env_variable: "DATABASE_URL",
  },
};
