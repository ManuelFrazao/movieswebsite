// models/favorite.js
import { DataTypes } from "sequelize";

const FavoriteModel = (sequelize) => {
  const Favorite = sequelize.define("Favorite", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    targetId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    targetType: {
      type: DataTypes.ENUM("entry", "episode", "character", "actor"),
      allowNull: false,
    },
  });

  return Favorite;
};

export default FavoriteModel;
