import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getDashboardOrders } from "../controllers/orderController.js";
import { getOrderById } from "../controllers/orderController.js";
import { getDashboardPayments, getPaymentsByOrderNumber, getPaymentsByUserController } from "../controllers/paymentController.js";
import { getDashboardShipments, getMyShipments } from "../controllers/shipmentController.js";
import { getDashboardProfile } from "../controllers/userController.js";
import { getPaymentsByUser } from "../services/paymentService.js";

const router = express.Router();

router.use(protect); // All routes require logged-in user

router.get("/orders", getDashboardOrders);


router.get("/profile", getDashboardProfile);
router.get('/dashboard', protect, getDashboardPayments);
router.get("/payments", protect, getPaymentsByUserController);
router.get("/my", protect, getMyShipments);
router.get("/user",protect, getDashboardShipments);

export default router;
