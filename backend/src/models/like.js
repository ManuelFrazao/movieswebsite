import { DataTypes } from "sequelize";

const LikeModel = (sequelize) => {
  const Like = sequelize.define("Like", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    type: {
      type: DataTypes.ENUM("entry", "episode", "review"),
      allowNull: false,
    },
  });

  return Like;
};

export default LikeModel;