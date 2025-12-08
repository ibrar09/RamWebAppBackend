// routes/cartItemRoutes.js
/**
 * @swagger
 * tags:
 *   name: Cart Items
 *   description: API endpoints for managing cart items
 */

import express from "express";
import {
  addToCart,
  getUserCart,
  updateCartItem,
  deleteCartItem,
  clearUserCart
} from "../controllers/cartItemController.js";

const router = express.Router();

/**
 * @swagger
 * /cart-items:
 *   post:
 *     summary: Add an item to the cart
 *     tags: [Cart Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - product_id
 *               - quantity
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               product_id:
 *                 type: integer
 *                 example: 5
 *               variant_id:
 *                 type: integer
 *                 example: 2
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *       400:
 *         description: Invalid input
 */
router.post("/", addToCart);

/**
 * @swagger
 * /cart-items/user/{user_id}:
 *   get:
 *     summary: Get all cart items for a user
 *     tags: [Cart Items]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of cart items
 *       404:
 *         description: User cart not found
 *   delete:
 *     summary: Clear all cart items for a user
 *     tags: [Cart Items]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       404:
 *         description: User cart not found
 */
router.get("/user/:user_id", getUserCart);
router.delete("/user/:user_id", clearUserCart);

/**
 * @swagger
 * /cart-items/{id}:
 *   put:
 *     summary: Update quantity of a cart item
 *     tags: [Cart Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       404:
 *         description: Cart item not found
 *   delete:
 *     summary: Remove a cart item
 *     tags: [Cart Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Cart item deleted successfully
 *       404:
 *         description: Cart item not found
 */
router.put("/:id", updateCartItem);
router.delete("/:id", deleteCartItem);

export default router;
