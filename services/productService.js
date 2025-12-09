import { Product, Category, Brand, ProductDetail } from "../models/Index.js";
import { Op, fn, col, where, literal } from "sequelize";

/**
 * Helper: safely parse JSON, return [] if invalid
 */
const parseJSONSafe = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

/**
 * Helper: normalize boolean values
 */
const normalizeBool = (val) => val === true || val === "true" || val === 1 || val === "1";

/**
 * Get all products with details
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: Brand, as: "brand", attributes: ["id", "name"] },
        { model: ProductDetail, as: "details" },
      ],
    });

    const result = products.map((p) => {
      const plain = p.get({ plain: true });
      return {
        ...plain,
        category_name: plain.category?.name || "-",
        brand_name: plain.brand?.name || "-",
        key_features: parseJSONSafe(plain.key_features),
        image_urls: parseJSONSafe(plain.image_urls),
      };
    });

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get a single product by ID with details
 */
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: Brand, as: "brand", attributes: ["id", "name"] },
        { model: ProductDetail, as: "details" },
      ],
    });

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const plain = product.get({ plain: true });
    return res.json({
      success: true,
      data: {
        ...plain,
        category_name: plain.category?.name || "-",
        brand_name: plain.brand?.name || "-",
        key_features: parseJSONSafe(plain.key_features),
        image_urls: parseJSONSafe(plain.image_urls),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Create a new product with details
 */
export const createProduct = async (req, res) => {
  try {
    const {
      name, description, price, oldprice, stock, category_id, brand_id, sku,
      key_features, status, subcategory,
      is_new_release, is_best_seller, is_hot_deal,
      material, color, size, feature, model_number, payment, usage, delivery_time, note
    } = req.body;

    const files = req.files || [];
    const uploadedImages = files.map((f) => `/uploads/${f.filename}`) || [];

    if (!name || !price || !category_id || !brand_id) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      oldprice: oldprice !== undefined && oldprice !== null && oldprice !== "" ? Number(oldprice) : null,
      stock: stock !== undefined && stock !== "" ? Number(stock) : 0,
      category_id,
      brand_id,
      sku,
      subcategory,
      image_urls: JSON.stringify(uploadedImages),
      key_features: key_features ? JSON.stringify(key_features) : JSON.stringify([]),
      status,
      is_new_release: normalizeBool(is_new_release),
      is_best_seller: normalizeBool(is_best_seller),
      is_hot_deal: normalizeBool(is_hot_deal),
    });

    await ProductDetail.create({
      product_id: product.id,
      material, color, size, feature, model_number, payment, usage, delivery_time, note
    });

    return getProductById({ params: { id: product.id } }, res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update a product and its details
 */
export const updateProduct = async (req, res) => {
  console.log("Update payload:", req.body);

  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const {
      name, description, price, oldprice, stock, category_id, brand_id, sku,
      key_features, status, subcategory,
      is_new_release, is_best_seller, is_hot_deal,
      material, color, size, feature, model_number, payment, usage, delivery_time, note
    } = req.body;

    const files = req.files || [];
    const uploadedImages = files.map((f) => `/uploads/${f.filename}`) || [];

    await product.update({
      name,
      description,
      price: price !== undefined && price !== "" ? Number(price) : product.price,
      oldprice: oldprice !== undefined && oldprice !== null && oldprice !== "" ? Number(oldprice) : product.oldprice,
      stock: stock !== undefined && stock !== "" ? Number(stock) : product.stock,
      category_id,
      brand_id,
      sku,
      subcategory,
      image_urls: uploadedImages.length > 0 ? JSON.stringify(uploadedImages) : product.image_urls,
      key_features: key_features !== undefined ? JSON.stringify(key_features) : product.key_features,
      status,
      is_new_release: normalizeBool(is_new_release),
      is_best_seller: normalizeBool(is_best_seller),
      is_hot_deal: normalizeBool(is_hot_deal),
    });

    let details = await ProductDetail.findOne({ where: { product_id: id } });
    if (details) {
      await details.update({ material, color, size, feature, model_number, payment, usage, delivery_time, note });
    } else {
      await ProductDetail.create({ product_id: id, material, color, size, feature, model_number, payment, usage, delivery_time, note });
    }

    return getProductById({ params: { id } }, res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Delete a product and its details
 */
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await ProductDetail.destroy({ where: { product_id: id } });

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    await product.destroy();
    return res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// searching Filter
// const parseJSONSafe = (value) => {
//   if (!value) return [];
//   if (Array.isArray(value)) return value;
//   try {
//     return JSON.parse(value);
//   } catch {
//     return [];
//   }
// };

/**
 * Helper: normalize boolean values
 */


 


/**
 * Fuzzy search using PostgreSQL similarity (pg_trgm)
 */
export const searchProductsService = async (query) => {
  if (!query) return [];

  const lowerQuery = query.toLowerCase();

  // Fetch products where any field contains the query (ILIKE for case-insensitive)
  let products = await Product.findAll({
    where: {
      status: "active", // only active products
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
        { subcategory: { [Op.iLike]: `%${query}%` } },
      ],
    },
    include: [
      { model: Brand, as: "brand", attributes: ["id", "name"] },
      { model: Category, as: "category", attributes: ["id", "name"] },
      { model: ProductDetail, as: "details" },
    ],
    limit: 50, // limit to avoid loading too many cards
  });

  // Filter manually to include brand/category matches
  products = products.filter((p) => {
    const plain = p.get({ plain: true });
    const nameMatch = plain.name?.toLowerCase().includes(lowerQuery);
    const descMatch = plain.description?.toLowerCase().includes(lowerQuery);
    const subcatMatch = plain.subcategory?.toLowerCase().includes(lowerQuery);
    const brandMatch = plain.brand?.name?.toLowerCase().includes(lowerQuery);
    const categoryMatch = plain.category?.name?.toLowerCase().includes(lowerQuery);
    return nameMatch || descMatch || subcatMatch || brandMatch || categoryMatch;
  });

  // Sort: exact name match first, then others
  products.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();

    if (aName === lowerQuery && bName !== lowerQuery) return -1;
    if (aName !== lowerQuery && bName === lowerQuery) return 1;

    if (aName.startsWith(lowerQuery) && !bName.startsWith(lowerQuery)) return -1;
    if (!aName.startsWith(lowerQuery) && bName.startsWith(lowerQuery)) return 1;

    return 0; // keep relative order for others
  });

  return products.map((p) => {
    const plain = p.get({ plain: true });
    return {
      ...plain,
      category_name: plain.category?.name || "-",
      brand_name: plain.brand?.name || "-",
      key_features: parseJSONSafe(plain.key_features),
      image_urls: parseJSONSafe(plain.image_urls),
    };
  });
};