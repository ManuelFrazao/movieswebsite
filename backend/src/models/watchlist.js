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
    entryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

  return Watchlist;
};

export default WatchlistModel;
