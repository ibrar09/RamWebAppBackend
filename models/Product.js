import { DataTypes } from "sequelize";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

export default (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      oldprice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      sku: { type: DataTypes.STRING, unique: true },
      stock: { type: DataTypes.INTEGER, defaultValue: 0 },
      category_id: { type: DataTypes.INTEGER, allowNull: true },
      brand_id: { type: DataTypes.INTEGER, allowNull: true },
      subcategory: { type: DataTypes.STRING, allowNull: false },
      image_urls: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
      key_features: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
      is_new_release: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_best_seller: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_hot_deal: { type: DataTypes.BOOLEAN, defaultValue: false },
      status: {
        type: DataTypes.ENUM("active", "inactive", "discontinued"),
        defaultValue: "active",
      },
    },
    {
      tableName: "products",
      timestamps: false,
      createdAt: "created_at",
      updatedAt: "updated_at",
      hooks: {
        beforeCreate: async (product) => {
          if (!product.sku) {
            const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            product.sku = `SKU-${dateCode}-${nanoid()}`;
          }
        },
      },
    }
  );

  return Product;
};
