// controllers/orderController.js
import tapService from "../services/tapService.js";
import { nanoid } from "nanoid";
import { Order, UserAddress, OrderItem , Product , ProductVariant,User,Payment, Shipment, } from "../models/index.js";

/**
 * CREATE NEW ORDER
 */

export const createOrder = async (req, res) => {
  try {
    const { user_id, items, address, payment_method } = req.body;
    console.log("🛒 [createOrder] Received request body:", req.body);

    // Validate required fields
    if (!user_id || !items?.length || !address || !payment_method) {
      console.error("❌ [createOrder] Missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1️⃣ Save user address
    console.log("📌 [createOrder] Saving user address...");
    const savedAddress = await UserAddress.create({
      user_id,
      full_name: address.full_name || "N/A",
      phone: address.phone || "0000000000",
      address_line1: address.street || "No Address Provided",
      address_line2: address.address_line2 || "",
      city: address.city || "N/A",
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "N/A",
      is_default: false,
    });
    console.log("✅ [createOrder] Address saved:", savedAddress.id);

    // 2️⃣ Calculate totals
    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const tax = +(subtotal * 0.05).toFixed(2);
    const shipping = 20;
    const total = subtotal + tax + shipping;
    const order_number = `ORD-${Date.now()}-${nanoid(8)}`;
    console.log(
      `📌 [createOrder] Totals - subtotal: ${subtotal}, tax: ${tax}, shipping: ${shipping}, total: ${total}`
    );

    // 3️⃣ Create order
    console.log("📌 [createOrder] Creating order...");
    const newOrder = await Order.create({
      user_id,
      address_id: savedAddress.id,
      subtotal,
      tax,
      shipping,
      total,
      payment_method,
      status: "pending",
      payment_status: "unpaid",
      order_number,
    });
    console.log("✅ [createOrder] Order created:", newOrder.id);

    // 4️⃣ Insert OrderItems
    for (const item of items) {
      console.log("📦 [createOrder] Processing OrderItem:", item);
      const productExists = await Product.findByPk(item.product_id);
      console.log("🔍 [createOrder] Product found:", productExists?.name);

      if (!productExists) {
        console.error(`❌ Product ID ${item.product_id} not found`);
        return res.status(400).json({
          message: `Product with ID ${item.product_id} does not exist.`,
        });
      }

      if (productExists.stock < item.quantity) {
        console.error(`❌ Not enough stock for ${productExists.name}`);
        return res.status(400).json({
          message: `Not enough stock for ${productExists.name}.`,
        });
      }

      const orderItem = await OrderItem.create({
        order_id: newOrder.id,
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      });
      console.log("✅ OrderItem created:", orderItem.id);
    }

    // 5️⃣ Handle Tap payment
    if (payment_method === "tap") {
      console.log("💳 Processing Tap payment...");
      const redirectUrl = `${process.env.FRONTEND_URL}/payment/success`;

      const tapResponse = await tapService.createPayment({
        amount: Math.round(total * 100),
        currency: "SAR",
        customer: {
          first_name: req.user?.name || "Guest",
          email: req.user?.email || "guest@example.com",
        },
        order_id: order_number,
        source: { id: "src_all" },
        redirect: { url: redirectUrl },
      });

      console.log("📌 Tap response:", tapResponse);

      if (!tapResponse || !tapResponse.id) {
        console.error("❌ Invalid Tap response", tapResponse);
        return res.status(500).json({ message: "Payment gateway error" });
      }

      const { mapTapStatusToApp } = await import("../utils/paymentStatus.js");
      const mapped = mapTapStatusToApp(tapResponse.status);

      newOrder.tap_charge_id = tapResponse.id;
      newOrder.tap_payment_response = tapResponse;
      newOrder.payment_status = mapped.orderPaymentStatus;
      await newOrder.save();
      console.log("✅ Order updated with Tap info");

      const paymentRecord = await Payment.create({
        order_id: newOrder.id,
        userId: user_id,
        payment_reference: tapResponse.id,
        payment_method: "tap",
        amount: total,
        status: mapped.paymentStatus,
        gateway_response: JSON.stringify(tapResponse),
      });
      console.log("✅ Payment record created:", paymentRecord.id);

      return res.status(201).json({
        message: "Order created successfully",
        order: newOrder,
        tap_checkout_url: tapResponse.transaction.url || null,
      });
    }

    console.log("💰 Non-Tap payment, order completed");
    return res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (err) {
    console.error("❌ [createOrder] Error:", err.response?.data || err.message || err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET ALL ORDERS (admin or user)
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: "user", // must match Order.belongsTo(User, { as: "user" })
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: UserAddress,
          as: "address", // must match Order.belongsTo(UserAddress, { as: "address" })
          attributes: [
            "id",
            "full_name",
            "phone",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "country",
            "postal_code",
          ],
        },
        {
          model: OrderItem,
          as: "items", // must match Order.hasMany(OrderItem, { as: "items" })
          attributes: ["id", "quantity", "price", "variant_id"],
          include: [
            {
              model: Product,
              as: "productDetails", // must match OrderItem.belongsTo(Product, { as: "productDetails" })
              attributes: ["id", "name", "price", "image_urls"],
            },
            {
              model: ProductVariant,
              as: "variant", // must match OrderItem.belongsTo(ProductVariant, { as: "variant" })
              attributes: [
                "id",
                "variant_name",
                "variant_value",
                "additional_price",
                "stock",
                "sku",
              ],
            },
          ],
        },
        {
          model: Payment,
          as: "payments", // must match Order.hasMany(Payment, { as: "payments" })
          attributes: ["id", "amount", "status", "payment_method"],
        },
        {
          model: Shipment,
          as: "shipments", // must match Order.hasMany(Shipment, { as: "shipments" })
          attributes: [
            "id",
            "tracking_number",
            "courier_name", // updated field instead of "carrier"
            "status",
            "shipped_date",
            "delivery_date",
            "notes",
            "admin_comment",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("❌ [getAllOrders] Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};


/**
 * GET MY ORDERS
 */
// controllers/orderController.js
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "productDetails", // must match your associations
              attributes: ["id", "name", "price"], // <-- added image
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const formatted = orders.map((order) => {
      const items = order.items.map((item) => {
        const product = item.productDetails;

        return {
          item_id: item.id,
          product_id: item.product_id,

          // ⭐ PRODUCT NAME
          product_name: product?.name || "Unknown Product",

          // ⭐ PRODUCT IMAGE (if needed)
        

          // ⭐ PRODUCT PRICE
          unit_price: product?.price || item.price,

          quantity: item.quantity,

          // ⭐ Subtotal per item
          total_price: (
            item.quantity * (product?.price || item.price)
          ).toFixed(2),
        };
      });

      return {
        order_id: order.id,
        status: order.status,
        created_at: order.created_at,

        total_items: items.length,

        // ⭐ Total of all items
        order_total: items
          .reduce((sum, i) => sum + Number(i.total_price), 0)
          .toFixed(2),

        items,
      };
    });

    return res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ [getMyOrders] Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};


/**
 * GET ORDER BY ID
 */


export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    let order;

    if (id === "my-orders") {
     
      // ✅ Fetch latest order for logged-in user
      order = await Order.findOne({
        where: { user_id: req.user.id },
        include: [{ model: OrderItem, as: "items" }],
        order: [["createdAt", "DESC"]],
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "No orders found for this user",
        });
      }
    } else {
      // ✅ Fetch by numeric ID
      order = await Order.findByPk(id, {
        include: [{ model: OrderItem, as: "items" }],
      });

      if (!order) return res.status(404).json({ success: false, message: "Order not found" });

      // Only allow access if admin or the owner
      if (req.user.role !== "admin" && order.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error("❌ [getOrderById] Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
};

/**
 * UPDATE ORDER (admin only)
 */
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    await order.update(req.body);
    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error("❌ [updateOrder] Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update order" });
  }
};

/**
 * DELETE ORDER (admin only)
 */
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    await order.destroy();
    return res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("❌ [deleteOrder] Error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete order" });
  }
};

/**
 * CREATE TAP PAYMENT (separate route)
 */
export const createTapPayment = async (req, res) => {
  try {
    const { orderId, amount, currency = "SAR", description, source_id } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const tapResponse = await tapService.createPayment({
      amount: amount * 100,
      currency,
      customer: {
        first_name: req.user.name || "Customer",
        email: req.user.email,
      },
      source_id,
      description: description || `Payment for order ${order.order_number}`,
      order_id: order.order_number,
    });

    // ✅ Save tap_charge_id AND full response
    order.tap_charge_id = tapResponse.id;
    order.tap_payment_response = tapResponse;
    await order.save();

    return res.status(200).json({ success: true, tap: tapResponse });
  } catch (error) {
    console.error("❌ [createTapPayment] Error:", error.response?.data || error);
    return res.status(500).json({ success: false, message: error.message });
  }
};



export const captureTapPayment = async (req, res) => {
  try {
    const { tapPaymentId } = req.body;
    if (!tapPaymentId) return res.status(400).json({ message: "tapPaymentId is required" });

    const order = await Order.findOne({ where: { tap_charge_id: tapPaymentId } });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Already captured
    if (order.tap_payment_response?.status === "CAPTURED") {
      order.payment_status = "paid";
      order.status = "completed";
      await order.save();
      return res.status(200).json({ success: true, order, tap: order.tap_payment_response });
    }

    // Capture payment via TapService
    const captureResponse = await tapService.capturePayment(tapPaymentId);

    if (captureResponse?.status === "CAPTURED") {
      order.payment_status = "paid";
      order.status = "completed";
    } else {
      console.warn("⚠️ Payment capture not successful:", captureResponse);
    }

    await order.save();
    return res.status(200).json({ success: true, order, tap: captureResponse });
  } catch (err) {
    console.error("❌ [captureTapPayment] Error:", err.response?.data || err.message);
    return res.status(500).json({ message: "Failed to capture payment" });
  }
};  


/**
 * CAPTURE TAP PAYMENT
 */
// 




/**
 * CANCEL ORDER
 */
// export const cancelOrder = async (req, res) => {
//   try {
//     const order = await Order.findByPk(req.params.id);
//     if (!order) return res.status(404).json({ success: false, message: "Order not found" });
//     if (order.user_id !== req.user.id) return res.status(403).json({ success: false, message: "Access denied" });
//     if (order.status !== "pending") return res.status(400).json({ success: false, message: "Cannot cancel this order" });

//     order.status = "cancelled";
//     await order.save();
//     return res.status(200).json({ success: true, message: "Order cancelled" });
//   } catch (err) {
//     console.error("❌ [cancelOrder] Error:", err);
//     return res.status(500).json({ success: false, message: "Failed to cancel order" });
//   }
// };




export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: "items" }],
    });

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.user_id !== req.user.id) return res.status(403).json({ success: false, message: "Access denied" });
    if (order.status !== "pending") return res.status(400).json({ success: false, message: "Cannot cancel this order" });

    // ✅ Restore stock for each order item
    await sequelize.transaction(async (t) => {
      for (const item of order.items) {
        const product = await Product.findByPk(item.product_id, { transaction: t });
        if (product) {
          product.stock = product.stock + item.quantity;
          await product.save({ transaction: t });
        }
      }
    });

    order.status = "cancelled";
    await order.save();

    return res.status(200).json({ success: true, message: "Order cancelled and stock restored" });
  } catch (err) {
    console.error("❌ [cancelOrder] Error:", err);
    return res.status(500).json({ success: false, message: "Failed to cancel order" });
  }
};

export const getTapPaymentStatus = async (req, res) => {
  try {
    const { tapId } = req.params;
    if (!tapId) return res.status(400).json({ message: "tapId is required" });

    const order = await Order.findOne({ where: { tap_charge_id: tapId } });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Fetch latest status from TAP
    const charge = await tapService.getPaymentStatus(tapId);

    // Update order in DB based on TAP status
    if (charge.status === "CAPTURED") {
      order.payment_status = "paid";
      order.status = "completed";
    } else if (charge.status === "DECLINED") {
      order.payment_status = "failed";
      order.status = "pending"; // Or "failed" if you want
    } else if (charge.status === "INITIATED") {
      order.payment_status = "unpaid";
      order.status = "pending";
    }

    // Save the full TAP response for logging/debugging
    order.tap_payment_response = charge;
    await order.save();

    return res.status(200).json({ status: charge.status, charge });
  } catch (err) {
    console.error("❌ [getTapPaymentStatus] Error:", err.response?.data || err.message);
    return res.status(500).json({ message: "Failed to get TAP payment status" });
  }
};







export const getDashboardOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "productDetails",
              attributes: ["id", "name", "price"],
            },
          ],
        },
        { model: Shipment, as: "shipments" },
        { model: Payment, as: "payments" },
      ],
      order: [["created_at", "DESC"]],
    });

    const formatted = orders.map((order) => {
      const items = order.items.map((item) => {
        const product = item.productDetails;
        return {
          item_id: item.id,
          product_id: item.product_id,
          product_name: product?.name || "Unknown",
          product_image: product?.image || null,
          unit_price: product?.price || item.price,
          quantity: item.quantity,
          total_price: (item.quantity * (product?.price || item.price)).toFixed(2),
        };
      });

      const total_order_amount = items.reduce((sum, i) => sum + Number(i.total_price), 0);

      return {
        order_id: order.id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        created_at: order.created_at,
        total_items: items.length,
        order_total: total_order_amount.toFixed(2),
        items,
        shipment: order.shipment || null,
        payments: order.payments || [],
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ [getDashboardOrders] Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};


