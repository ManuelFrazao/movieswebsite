import { sequelize } from "../config/database.js";

import UserModel from "./user.js";
import EntryModel from "./entry.js";
import SeasonModel from "./seasons.js";
import EpisodeModel from "./episode.js";
import VoteModel from "./vote.js";
import ReviewModel from "./review.js";
import LikeModel from "./like.js";

const User = UserModel(sequelize);
const Entry = EntryModel(sequelize);
const Season = SeasonModel(sequelize);
const Episode = EpisodeModel(sequelize);
const Vote = VoteModel(sequelize);
const Review = ReviewModel(sequelize);
const Like = LikeModel(sequelize);

// =====================
// RELATIONS
// =====================

// Entry → Seasons
Entry.hasMany(Season, {
  foreignKey: "entryId",
  as: "seasons",
    onDelete: "CASCADE",
  hooks: true,
});

Season.belongsTo(Entry, {
  foreignKey: "entryId",
  as: "entry",
});

// Season → Episodes
Season.hasMany(Episode, {
  foreignKey: "seasonId",
  as: "episodes",
    onDelete: "CASCADE",
  hooks: true,
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

// =====================
// REVIEWS
// =====================

// User → Reviews
User.hasMany(Review, {
  foreignKey: "userId",
  as: "reviews",
});

Review.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Entry → Reviews
Entry.hasMany(Review, {
  foreignKey: "entryId",
  as: "reviews",
});

Review.belongsTo(Entry, {
  foreignKey: "entryId",
  as: "entry",
});

// Episode → Reviews
Episode.hasMany(Review, {
  foreignKey: "episodeId",
  as: "reviews",
});

Review.belongsTo(Episode, {
  foreignKey: "episodeId",
  as: "episode",
});

// =====================
// Likes
// =====================
// User → Likes
User.hasMany(Like, {
  foreignKey: "userId",
  as: "likes",
});

Like.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Entry
Entry.hasMany(Like, {
  foreignKey: "entryId",
  as: "likes",
});

Like.belongsTo(Entry, {
  foreignKey: "entryId",
  as: "entry",
});

// Episode
Episode.hasMany(Like, {
  foreignKey: "episodeId",
  as: "likes",
});

Like.belongsTo(Episode, {
  foreignKey: "episodeId",
  as: "episode",
});

// Review
Review.hasMany(Like, {
  foreignKey: "reviewId",
  as: "likes",
});

Like.belongsTo(Review, {
  foreignKey: "reviewId",
  as: "review",
});

export { sequelize, User, Entry, Season, Episode, Vote, Review, Like };