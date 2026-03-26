import { DataTypes } from "sequelize";

const CastModel = (sequelize) => {
  const Cast = sequelize.define("Cast", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    actorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    characterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    entryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    roleType: {
      type: DataTypes.ENUM("main", "supporting", "guest"),
      defaultValue: "supporting",
    },

    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  return Cast;
};

export default CastModel;
