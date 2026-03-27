import { DataTypes } from "sequelize";

const CharacterModel = (sequelize) => {
  const Character = sequelize.define("Character", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    image: DataTypes.STRING,
    description: DataTypes.TEXT,
  });

  return Character;
};

export default CharacterModel;
