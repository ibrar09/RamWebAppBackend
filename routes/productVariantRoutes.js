// routes/productVariantRoutes.js
/**
 * @swagger
 * tags:
 *   name: Product Variants
 *   description: API endpoints for managing product variants
 */

/**
 * @swagger
 * /product-variants:
 *   post:
 *     summary: Create a new product variant
 *     tags: [Product Variants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - variant_name
 *               - variant_value
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *               variant_name:
 *                 type: string
 *                 example: "Color"
 *               variant_value:
 *                 type: string
 *                 example: "Red"
 *               additional_price:
 *                 type: number
 *                 example: 10.5
 *               stock:
 *                 type: integer
 *                 example: 50
 *               sku:
 *                 type: string
 *                 example: "RED-XL-001"
 *     responses:
 *       201:
 *         description: Variant created successfully
 *   get:
 *     summary: Get all product variants
 *     tags: [Product Variants]
 *     responses:
 *       200:
 *         description: List of all variants
 */

/**
 * @swagger
 * /product-variants/product/{product_id}:
 *   get:
 *     summary: Get variants by product ID
 *     tags: [Product Variants]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the product
 *     responses:
 *       200:
 *         description: List of variants
 */

/**
 * @swagger
 * /product-variants/{id}:
 *   put:
 *     summary: Update variant by ID
 *     tags: [Product Variants]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Variant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               variant_name:
 *                 type: string
 *               variant_value:
 *                 type: string
 *               additional_price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               sku:
 *                 type: string
 *     responses:
 *       200:
 *         description: Variant updated
 *   delete:
 *     summary: Delete variant by ID
 *     tags: [Product Variants]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Variant ID
 *     responses:
 *       200:
 *         description: Variant deleted
 */

import express from "express";
import {
  createVariant,
  getAllVariants,
  getVariantsByProductId,
  updateVariant,
  deleteVariant,
} from "../controllers/productVariantController.js";

const router = express.Router();

// CRUD routes
router.post("/", createVariant);                         // Create
router.get("/", getAllVariants);                        // Get all
router.get("/product/:product_id", getVariantsByProductId); // Get variants by product
router.put("/:id", updateVariant);                      // Update by ID
router.delete("/:id", deleteVariant);                   // Delete by ID

export default router;
