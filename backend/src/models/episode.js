import { DataTypes } from "sequelize";

const EntryModel = (sequelize) => {
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

    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    votes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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

export default EntryModel;
