import { DataTypes } from "sequelize";

const VoteModel = (sequelize) => {
  const Vote = sequelize.define("Vote", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("entry", "episode"),
      allowNull: false,
    }
  });

  return Vote;
};

export default VoteModel;