import { sequelize } from "../config/database.js";

import UserModel from "./user.js";
import EntryModel from "./entry.js";
import SeasonModel from "./seasons.js";
import EpisodeModel from "./episode.js";
import VoteModel from "./vote.js";

const User = UserModel(sequelize);
const Entry = EntryModel(sequelize);
const Season = SeasonModel(sequelize);
const Episode = EpisodeModel(sequelize);
const Vote = VoteModel(sequelize);

// =====================
// RELATIONS
// =====================

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

// Entry → Episodes
Entry.hasMany(Episode, {
  foreignKey: "entryId",
  as: "episodes",
});

Episode.belongsTo(Entry, {
  foreignKey: "entryId",
  as: "entry",
});

// =====================
// VOTES RELATIONS 
// =====================

// User → Votes
User.hasMany(Vote, {
  foreignKey: "userId",
  as: "votes",
});

Vote.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Entry → Votes
Entry.hasMany(Vote, {
  foreignKey: "entryId",
  as: "votes",
});

Vote.belongsTo(Entry, {
  foreignKey: "entryId",
  as: "entry",
});

// Episode → Votes
Episode.hasMany(Vote, {
  foreignKey: "episodeId",
  as: "votes",
});

Vote.belongsTo(Episode, {
  foreignKey: "episodeId",
  as: "episode",
});

export { sequelize, User, Entry, Season, Episode, Vote };