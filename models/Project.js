// src/models/Project.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Project = sequelize.define(
    "Project",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      category: { type: DataTypes.STRING },
      client: { type: DataTypes.STRING },
      year: { type: DataTypes.INTEGER },
      duration: { type: DataTypes.STRING },
      budget: { type: DataTypes.STRING },
      featured: { type: DataTypes.BOOLEAN, defaultValue: false },
      team_size: { type: DataTypes.INTEGER }, // match DB column
      image: { type: DataTypes.STRING },
      description: { type: DataTypes.TEXT },
    },
    {
      tableName: "projects",
      timestamps: false,
    }
  );

  return Project;
};
