// models/watchlist.js
import { DataTypes } from "sequelize";

const WatchlistModel = (sequelize) => {
  const Watchlist = sequelize.define("Watchlist", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    watchlistCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  return Watchlist;
};

export default WatchlistModel;
