// services/tapService.js
import axios from "axios";

const TAP_BASE_URL = "https://api.tap.company/v2";
const TAP_SECRET_KEY = process.env.TAP_SECRET_KEY;

const headers = {
  Authorization: `Bearer ${TAP_SECRET_KEY}`,
  "Content-Type": "application/json",
};

const TapService = {
  /**
   * Create a new payment/charge
   */
  createPayment: async ({ amount, currency, customer, description, order_id, source_id, method = "CREATE" }) => {
    const data = {
      amount,
      currency,
      threeDSecure: true,
      save_card: false,
      description,
      statement_descriptor: "MAAJ Store",
      metadata: { order_id },
      customer,
      source: { id: source_id || "src_all" },
      redirect: { url: "http://localhost:3000/payment/success" },
      method, // "CREATE" or "AUTHORIZE"
    };

    console.log("🔹 [TapService] Creating payment with data:", data);

    const response = await axios.post(`${TAP_BASE_URL}/charges`, data, { headers });
    console.log("🟢 [TapService] Payment response:", response.data);
    return response.data;
  },

  /**
   * Capture a payment (for AUTHORIZE method)
   */
  capturePayment: async (chargeId) => {
    console.log(`🔹 [TapService] Capturing charge: ${chargeId}`);
    const response = await axios.post(`${TAP_BASE_URL}/charges/${chargeId}/capture`, {}, { headers });
    console.log("🟢 [TapService] Capture response:", response.data);
    return response.data;
  },

  /**
   * Retrieve the status of a payment
   */
  getPaymentStatus: async (chargeId) => {
    console.log(`🔹 [TapService] Retrieving status for charge: ${chargeId}`);
    try {
      const response = await axios.get(`${TAP_BASE_URL}/charges/${chargeId}`, { headers });
      console.log("🟢 [TapService] Payment status response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [TapService] Error fetching charge status:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default TapService;
