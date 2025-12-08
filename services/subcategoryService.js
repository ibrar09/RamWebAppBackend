// services/subcategoryService.js
import { Subcategory , Category} from "../models/index.js";

export const createSubcategory = async (data) => {
  return await Subcategory.create(data);
};

export const getAllSubcategories = async () => {
  return await Subcategory.findAll({
    include: [{ model: Category, as: "category" }],
    order: [["id", "ASC"]],
  });
};

export const getSubcategoryById = async (id) => {
  return await Subcategory.findByPk(id, {
    include: [{ model: Category, as: "category" }],
  });
};

export const updateSubcategory = async (id, data) => {
  const subcategory = await Subcategory.findByPk(id);
  if (!subcategory) throw new Error("Subcategory not found");
  return await subcategory.update(data);
};

export const deleteSubcategory = async (id) => {
  const subcategory = await Subcategory.findByPk(id);
  if (!subcategory) throw new Error("Subcategory not found");
  await subcategory.destroy();
  return true;
};
