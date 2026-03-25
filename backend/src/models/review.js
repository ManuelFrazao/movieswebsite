import { DataTypes } from "sequelize";

const ReviewModel = (sequelize) => {
  const Review = sequelize.define("Review", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("entry", "episode"),
      allowNull: false,
    },
  });

  return Review;
};

export default ReviewModel;