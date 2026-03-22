import { sequelize } from "../config/database.js";

import UserModel from "./user.js";
import EntryModel from "./entry.js";
import SeasonModel from "./seasons.js";
import EpisodeModel from "./episode.js";

const User = UserModel(sequelize);
const Entry = EntryModel(sequelize);
const Season = SeasonModel(sequelize);
const Episode = EpisodeModel(sequelize);

//Relations

// Entry → Seasons
Entry.hasMany(Season, {
  foreignKey: "entryId",
  as: "seasons",
});

Season.belongsTo(Entry, {
  foreignKey: "entryId",
  as: "entry",
});

// Season → Episodes
Season.hasMany(Episode, {
  foreignKey: "seasonId",
  as: "episodes",
});

Episode.belongsTo(Season, {
  foreignKey: "seasonId",
  as: "season",
});

export { sequelize, User, Entry, Season, Episode };
