// import * as shipmentService from "../services/shipmentService.js";
// import { Shipment, Order } from "../models/index.js";

// // shipment 


// // controllers/shipmentController.js

// export const createShipment = async (req, res) => {
//   try {
//     const { order_number, status, delivery_date } = req.body;

//     const order = await Order.findOne({ where: { order_number } });
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const shipment = await Shipment.create({
//       order_id: order.id,
//       user_id: order.user_id,
//       status,
//       delivery_date: delivery_date || null,
//     });

//     order.status = status;
//     await order.save();

//     res.status(201).json(shipment);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to create shipment", error: error.message });
//   }
// };


// export const getAllShipments = async (req, res) => {
//   try {
//     const shipments = await Shipment.findAll({
//       include: [
//         {
//           model: Order,
//           as: "order",
//           attributes: ["order_number", "status"],
//         },
//       ],
//       order: [["created_at", "DESC"]],
//     });

//     const result = shipments.map((s) => ({
//       id: s.id, 
//       order_number: s.order?.order_number || "-",
//       status: s.status,
//       delivery_date: s.delivery_date,
//       admin_comment: s.admin_comment,
//     }));

//     return res.json({ shipments: result });
//   } catch (err) {
//     console.error("❌ Error fetching shipments:", err);
//     return res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };


// export const getShipmentById = async (req, res) => {
//   try {
//     const shipment = await shipmentService.getShipmentById(req.params.id);
//     res.json(shipment);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // controllers/shipmentController.js

// // controllers/shipmentController.js

// // Update shipment including comment
// export const updateShipment = async (req, res) => {
//   const { id } = req.params;
//   const { status, delivery_date, admin_comment } = req.body;

//   try {
//     const shipment = await Shipment.findByPk(id);
//     if (!shipment) {
//       return res.status(404).json({ message: "Shipment not found" });
//     }

//     if (status) shipment.status = status;
//     if (delivery_date) shipment.delivery_date = delivery_date;
//     if (admin_comment !== undefined) shipment.admin_comment = admin_comment;

//     await shipment.save();

//     // Sync order status
//     if (status) {
//       const order = await Order.findByPk(shipment.order_id);
//       if (order) {
//         order.status = status;
//         await order.save();
//       }
//     }

//     res.json({ message: "Shipment updated successfully", shipment });
//   } catch (error) {
//     console.error("Error updating shipment:", error);
//     res.status(500).json({ message: "Server error while updating shipment" });
//   }
// };


// export const deleteShipment = async (req, res) => {
//   try {
//     await shipmentService.deleteShipment(req.params.id);
//     res.json({ message: "Shipment deleted" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getShipmentsByOrder = async (req, res) => {
//   try {
//     const shipments = await shipmentService.getShipmentsByOrder(req.params.order_id);
//     res.json(shipments);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// // ---------------- Track shipment (mock for testing) ----------------
// export const trackShipment = async (req, res) => {
//   try {
//     const { trackingNumber } = req.params;

//     // Mock response for testing
//     const trackingData = {
//       tracking_number: trackingNumber,
//       status: "In Transit",
//       shipped_date: "2025-11-08T10:00:00Z",
//       delivery_date: "2025-11-12T18:00:00Z",
//       current_location: "Riyadh, KSA",
//     };

//     res.json(trackingData);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };



// export const getDashboardShipments = async (req, res) => {
//   try {
//     const shipments = await shipmentService.getShipmentsByUser(req.user.id);

//     const formatted = shipments.map((s) => ({
//       shipment_id: s.id,
//       order_number: s.order?.order_number || "-",
//       status: s.status,
//       tracking_number: s.tracking_number || null,
//       courier_name: s.courier_name || null,
//       shipped_date: s.shipped_date,
//       delivery_date: s.delivery_date,
//     }));

//     res.json({ success: true, count: formatted.length, data: formatted });
//   } catch (err) {
//     console.error("❌ [getDashboardShipments] Error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };
// export const getMyShipments = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     console.log(`✅ Fetching shipments for logged-in user: ${userId}`);

//     const shipments = await Shipment.findAll({
//       where: { user_id: userId },
//       include: [
//         {
//           model: Order,
//           as: "order", // must match the alias in belongsTo
//           attributes: ["order_number"],
//         },
//       ],
//       order: [["created_at", "DESC"]],
//     });

//     console.log(`🚚 Found shipments: ${shipments.length}`);

//     const formatted = shipments.map((s) => ({
//       shipment_id: s.id,
//       order_number: s.order ? s.order.order_number : "-", // use alias here
//       tracking_number: s.tracking_number,
//       status: s.status,
//       delivery_date: s.delivery_date,
//       admin_comment: s.admin_comment,
//     }));

//     res.json({ success: true, data: formatted });
//   } catch (err) {
//     console.error("❌ Error fetching shipments:", err);
//     res.status(500).json({ success: false, error: "Failed to fetch shipments." });
//   }
// };



// controllers/shipmentController.js
import * as shipmentService from "../services/shipmentService.js";
import * as aramexService from "../services/aramexService.js";
import { UserAddress, Shipment, Order, User } from "../models/Index.js";

// ---------- Create shipment (auto Aramex) ----------
export const createShipment = async (req, res) => {
  try {
    const { order_number, status, delivery_date } = req.body;

    // 1️⃣ Fetch order with related user and address using correct aliases
    const order = await Order.findOne({
      where: { order_number },
      include: [
        { model: User, as: "user" }, // matches association in Order model
        { model: UserAddress, as: "address" }, // matches association in Order model
      ],
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    // Fallbacks if phone or address are missing
    const contactName = order.user?.name || "N/A";
    const email = order.user?.email || "N/A";
    const phoneNumber = order.user?.phone || "0000000000";
    const addressLine = order.address?.address_line1 || "No Address Provided";
    const city = order.address?.city || "N/A";
    const country = order.address?.country || "N/A";

    console.log("📦 Order details:", {
      contact_name: contactName,
      email,
      phone_number: phoneNumber,
      address: addressLine,
      city,
      country,
    });

    // 2️⃣ Create shipment locally
    const shipment = await Shipment.create({
      order_id: order.id,
      user_id: order.user?.id,
      status: status || "pending",
      delivery_date: delivery_date || null,
    });

    // 3️⃣ Update order status if provided
    if (status) {
      order.status = status;
      await order.save();
    }

    // 4️⃣ Call Aramex API
    try {
      const aramexResponse = await aramexService.createAramexShipment({
        order_number: order.order_number,
        contact_name: contactName,
        email,
        phone_number: phoneNumber,
        address: addressLine,
        city,
        country,
        amount: order.total,
        currency: "SAR",
        weight: 1,
        pieces: 1,
        description: "Products",
      });

      if (aramexResponse?.Shipments?.[0]?.ID) {
        shipment.tracking_number = aramexResponse.Shipments[0].ID;
        shipment.courier_name = "Aramex";
        await shipment.save();
      }

      console.log("✅ Aramex shipment created:", aramexResponse);
    } catch (aramexErr) {
      console.warn("⚠️ Failed to create Aramex shipment:", aramexErr.message);
    }

    res.status(201).json({ success: true, shipment });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to create shipment", error: error.message });
  }
};

// ---------- Get all shipments ----------
export const getAllShipments = async (req, res) => {
  try {
    const shipments = await Shipment.findAll({
      include: [
        { model: Order, as: "order", attributes: ["order_number", "status"] },
      ],
      order: [["created_at", "DESC"]],
    });

    const result = shipments.map((s) => ({
      id: s.id,
      order_number: s.order?.order_number || "-",
      status: s.status,
      delivery_date: s.delivery_date,
      tracking_number: s.tracking_number || null,
      courier_name: s.courier_name || null,
      admin_comment: s.admin_comment,
    }));

    res.json({ success: true, count: result.length, data: result });
  } catch (err) {
    console.error("❌ Error fetching shipments:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------- Get shipment by ID ----------
export const getShipmentById = async (req, res) => {
  try {
    const shipment = await shipmentService.getShipmentById(req.params.id);
    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------- Update shipment ----------
export const updateShipment = async (req, res) => {
  const { id } = req.params;
  const { status, delivery_date, admin_comment } = req.body;

  try {
    const shipment = await Shipment.findByPk(id);
    if (!shipment) return res.status(404).json({ message: "Shipment not found" });

    if (status) shipment.status = status;
    if (delivery_date) shipment.delivery_date = delivery_date;
    if (admin_comment !== undefined) shipment.admin_comment = admin_comment;

    await shipment.save();

    // Sync order status
    if (status) {
      const order = await Order.findByPk(shipment.order_id);
      if (order) {
        order.status = status;
        await order.save();
      }
    }

    res.json({ success: true, message: "Shipment updated successfully", shipment });
  } catch (error) {
    console.error("Error updating shipment:", error);
    res.status(500).json({ message: "Server error while updating shipment" });
  }
};

// ---------- Delete shipment ----------
export const deleteShipment = async (req, res) => {
  try {
    await shipmentService.deleteShipment(req.params.id);
    res.json({ success: true, message: "Shipment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------- Get shipments by order ----------
export const getShipmentsByOrder = async (req, res) => {
  try {
    const shipments = await shipmentService.getShipmentsByOrder(req.params.order_id);
    res.json({ success: true, data: shipments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------- Track shipment ----------
export const trackShipment = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    if (trackingNumber) {
      const trackingData = await aramexService.trackAramexShipment(trackingNumber);
      return res.json({ success: true, data: trackingData });
    }

    res.status(400).json({ success: false, message: "Tracking number is required" });
  } catch (error) {
    console.error("❌ Error tracking shipment:", error);
    res.status(500).json({ error: error.message });
  }
};

// ---------- Get shipments for dashboard ----------
export const getDashboardShipments = async (req, res) => {
  try {
    const shipments = await shipmentService.getShipmentsByUser(req.user.id);

    const formatted = shipments.map((s) => ({
      shipment_id: s.id,
      order_number: s.order?.order_number || "-",
      status: s.status,
      tracking_number: s.tracking_number || null,
      courier_name: s.courier_name || null,
      shipped_date: s.shipped_date,
      delivery_date: s.delivery_date,
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    console.error("❌ [getDashboardShipments] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------- Get my shipments ----------
export const getMyShipments = async (req, res) => {
  try {
    const userId = req.user.id;
    const shipments = await Shipment.findAll({
      where: { user_id: userId },
      include: [
        { model: Order, as: "order", attributes: ["order_number"] },
      ],
      order: [["created_at", "DESC"]],
    });

    const formatted = shipments.map((s) => ({
      shipment_id: s.id,
      order_number: s.order?.order_number || "-",
      tracking_number: s.tracking_number,
      status: s.status,
      delivery_date: s.delivery_date,
      admin_comment: s.admin_comment,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ Error fetching shipments:", err);
    res.status(500).json({ success: false, error: "Failed to fetch shipments." });
  }
};
