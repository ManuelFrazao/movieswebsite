import { DataTypes } from "sequelize";

const ImageModel = (sequelize) => {
  const Image = sequelize.define("Image", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    caption: DataTypes.STRING,
    targetType: {
      type: DataTypes.ENUM("entry", "episode"),
      allowNull: false,
    },
    targetId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Image;
};

export default ImageModel;