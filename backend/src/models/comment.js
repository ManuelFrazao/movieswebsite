import { DataTypes } from "sequelize";

const CommentModel = (sequelize) => {
  const Comment = sequelize.define("Comment", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });
  return Comment;
};

export default CommentModel;