import { DataTypes } from "sequelize";

const EpisodeModel = (sequelize) => {
  const Episode = sequelize.define("Episode", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    airDate: {
      type: DataTypes.DATE,
    },
    thumbnail: {
      type: DataTypes.STRING,
    },
    duration: {
      type: DataTypes.INTEGER,
    },
    isFinal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return Episode;
};

export default EpisodeModel;
