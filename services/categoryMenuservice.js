// services/categoryMenu.service.js
import { Category, Product } from "../models/Index.js";

export const getCategoryMenuData = async () => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["id", "name", "subcategory"],
        },
      ],
      order: [["name", "ASC"]],
    });

    return categories.map((cat) => {
      const grouped = {};

      // Group products under their subcategory
      (cat.products || []).forEach((p) => {
        const sub = p.subcategory || "Other";
        if (!grouped[sub]) grouped[sub] = [];
        grouped[sub].push({ id: p.id, name: p.name });
      });

      // Format for frontend use
      return {
        id: cat.id,
        category: cat.name,
        subcategories: Object.entries(grouped).map(([name, products]) => ({
          name,
          products,
        })),
      };
    });
  } catch (error) {
    console.error("Error fetching category menu:", error);
    throw new Error("Failed to fetch category menu");
  }
};
