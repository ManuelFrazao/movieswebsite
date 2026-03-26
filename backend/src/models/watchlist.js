// models/watchlist.js
import { DataTypes } from "sequelize";

const WatchlistModel = (sequelize) => {
  const Watchlist = sequelize.define("Watchlist", {
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

  return Watchlist;
};

export default WatchlistModel;
