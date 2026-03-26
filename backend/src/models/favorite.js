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
    entryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

  return Favorite;
};

export default FavoriteModel;
