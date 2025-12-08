import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "ProductDetail",
    {
      material: DataTypes.STRING,
      color: DataTypes.STRING,
      size: DataTypes.STRING,
      feature: DataTypes.STRING,
      model_number: DataTypes.STRING,
      payment: DataTypes.STRING,
      usage: DataTypes.TEXT,
      delivery_time: DataTypes.STRING,
      note: DataTypes.TEXT,
      product_id: DataTypes.INTEGER
    },
    {
      tableName: "product_details",
      freezeTableName: true,
      timestamps: true
    }
  );
};
