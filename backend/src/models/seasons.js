import { DataTypes } from "sequelize";

const SeasonModel = (sequelize) => {
  const Season = sequelize.define("Season", {
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
    },
    description: {
      type: DataTypes.TEXT,
    },
    releaseDate: {
      type: DataTypes.DATE,
    },
    coverImage: {
      type: DataTypes.STRING,
    },
  });

  return Season;
};

export default SeasonModel;
