import express from "express";
import {
  createShipment,
  getAllShipments,
  getShipmentById,
  updateShipment,
  deleteShipment,
  getShipmentsByOrder,
  trackShipment,
} from "../controllers/shipmentController.js";

import { Shipment, Order } from "../models/Index.js";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ------------------------------
// Create Shipment (Admin)
// ------------------------------
router.post("/", protect, adminOnly, createShipment);

// ------------------------------
// Get all shipments (Admin)
// ------------------------------
router.get("/", protect, adminOnly, getAllShipments);

// ------------------------------
// Get logged-in user's shipments
// ------------------------------
router.get("/my", protect, async (req, res) => {
  try {
    console.log("Fetching shipments for user:", req.user.id);

    const userId = req.user.id;

    const userOrders = await Order.findAll({ where: { user_id: userId } });
    const orderIds = userOrders.map((o) => o.id);

    const shipments = await Shipment.findAll({
      where: { order_id: orderIds }
    });

    const shipmentsWithOrderNumber = shipments.map((s) => {
      const order = userOrders.find((o) => o.id === s.order_id);
      return {
        ...s.dataValues,
        order_number: order?.order_number || "-"
      };
    });

    res.json(shipmentsWithOrderNumber);
  } catch (err) {
    console.error("Error fetching shipments:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------------
// Track Shipment
// ------------------------------
router.get("/track/:trackingNumber", protect, trackShipment);

// ------------------------------
// Shipments by order id
// ------------------------------
router.get("/order/:order_id", protect, getShipmentsByOrder);

// ------------------------------
// IMPORTANT: Dynamic routes
// Must be at bottom
// ------------------------------
router.get("/:id", protect, getShipmentById);

router.put("/:id", protect, adminOnly, updateShipment);

router.delete("/:id", protect, adminOnly, deleteShipment);

export default router;
