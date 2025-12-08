// routes/orderItemRoutes.js
/**
 * @swagger
 * tags:
 *   name: Order Items
 *   description: API endpoints for managing order items
 *
 * /order-items:
 *   get:
 *     summary: Get all order items
 *     tags: [Order Items]
 *     responses:
 *       200:
 *         description: List of all order items
 *
 *   post:
 *     summary: Create a new order item
 *     tags: [Order Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - product_id
 *               - quantity
 *               - price
 *               - total
 *             properties:
 *               order_id:
 *                 type: integer
 *               product_id:
 *                 type: integer
 *               variant_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *               total:
 *                 type: number
 *
 * /order-items/order/{order_id}:
 *   get:
 *     summary: Get all items for a specific order
 *     tags: [Order Items]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: List of order items for that order
 *
 * /order-items/{id}:
 *   put:
 *     summary: Update order item
 *     tags: [Order Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *               total:
 *                 type: number
 *
 *   delete:
 *     summary: Delete an order item
 *     tags: [Order Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Order item deleted
 */

import express from "express";
import {
  createOrderItem,
  getAllOrderItems,
  getOrderItemsByOrderId,
  updateOrderItem,
  deleteOrderItem,
} from "../controllers/orderItemController.js";

const router = express.Router();

// Get all order items
router.get("/", getAllOrderItems);

// Create a new order item
router.post("/", createOrderItem);

// Get order items by specific order ID
router.get("/order/:order_id", getOrderItemsByOrderId);

// Update order item
router.put("/:id", updateOrderItem);

// Delete order item
router.delete("/:id", deleteOrderItem);

export default router;
