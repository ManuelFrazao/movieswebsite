import { DataTypes } from "sequelize";

const CharacterAliasModel = (sequelize) => {
  const CharacterAlias = sequelize.define("CharacterAlias", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    characterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    startSeason: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    endSeason: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });

  return CharacterAlias;
};

export default CharacterAliasModel;