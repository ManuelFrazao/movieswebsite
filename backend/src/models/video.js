import { DataTypes } from "sequelize";

const VideoModel = (sequelize) => {
  const Video = sequelize.define("Video", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: DataTypes.STRING,
    targetType: {
      type: DataTypes.ENUM("entry", "episode"),
      allowNull: false,
    },
    targetId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Video;
};

export default VideoModel;