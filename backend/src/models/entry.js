import { DataTypes } from "sequelize";

const EntryModel = (sequelize) => {
  const Entry = sequelize.define("Entry", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("movie", "series"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("not aired", "running", "ended"),
      defaultValue: "not aired",
    },
    description: DataTypes.TEXT,
    releaseDate: DataTypes.DATE,
    endingYear: DataTypes.INTEGER,
    coverImage: DataTypes.STRING,
    topRank: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    ageRating: DataTypes.STRING,
    genres: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    creators: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    writers: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    directors: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    summary: DataTypes.TEXT,
    storyline: DataTypes.TEXT,
    storylineAuthor: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    plotKeywords: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    tagline: DataTypes.STRING,
    countriesOrigin: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    language: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    alsoknownas: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    totalVotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  return Entry;
};

export default EntryModel;
