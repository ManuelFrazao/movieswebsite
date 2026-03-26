// models/favorite.js
import { DataTypes } from "sequelize";

const FavoriteModel = (sequelize) => {
  const Favorite = sequelize.define("Favorite", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    favoritesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  return Favorite;
};

export default FavoriteModel;
