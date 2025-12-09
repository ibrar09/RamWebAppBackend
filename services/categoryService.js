import { Category } from "../models/Index.js";
import { Op } from "sequelize"; // ✅ import Sequelize operators

export const createCategory = async (data) => {
  return await Category.create(data);
};
export const getAllCategories = async () => {
  return await Category.findAll({
    where: { status: "active" }, // ✅ assuming your table uses "status"
    order: [["id", "ASC"]],
  });
};


export const getCategoryById = async (id) => {
  return await Category.findByPk(id);
};

export const updateCategory = async (id, data) => {
  const category = await Category.findByPk(id);
  if (!category) throw new Error("Category not found");
  return await category.update(data);
};

export const deleteCategory = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) throw new Error("Category not found");
  await category.destroy();
  return true;
};

// ✅ Searching Filter for Navbar (Fixed)
export const searchCategories = async (keyword) => {
  return await Category.findAll({
    where: {
      name: {
        [Op.iLike]: `%${keyword}%`, // Case-insensitive match
      },
      status:"active"
    },
    order: [["id", "ASC"]],
  });
};
