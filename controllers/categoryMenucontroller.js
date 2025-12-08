// controllers/categoryMenu.controller.js
import { getCategoryMenuData } from "../services/categoryMenuservice.js";

export const getCategoryMenu = async (req, res) => {
  try {
    const menuData = await getCategoryMenuData();
    res.status(200).json(menuData);
  } catch (error) {
    console.error("Error in getCategoryMenu:", error);
    res.status(500).json({ error: error.message });
  }
};
