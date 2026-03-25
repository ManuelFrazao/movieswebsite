import { DataTypes } from "sequelize";

const ActorModel = (sequelize) => {
  const Actor = sequelize.define("Actor", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      indexes: true,
    },

    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    profileImage: DataTypes.STRING,

    bio: DataTypes.TEXT,

    birthDate: DataTypes.DATE,

    deathDate: DataTypes.DATE,

    birthplace: DataTypes.STRING,
  });

  return Actor;
};

export default ActorModel;