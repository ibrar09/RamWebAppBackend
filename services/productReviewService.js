// ✅ services/productReviewService.js
import { ProductReview, Order, OrderItem } from "../models/Index.js";

/**
 * Create a new review
 */
export const createReview = async (data) => {
  const { product_id, user_id, reviewer_type = "user" } = data;

  if (reviewer_type === "user") {
    // Step 1: Find all orders by this user
    const userOrders = await Order.findAll({ where: { user_id } });
    const orderIds = userOrders.map((order) => order.id);

    if (!orderIds.length) {
      throw new Error("User has no orders");
    }

    // Step 2: Check if product exists in any of those orders
    const purchased = await OrderItem.findOne({
      where: { product_id, order_id: orderIds },
    });

    if (!purchased) {
      throw new Error("User cannot review a product they haven't purchased");
    }

    data.status = "pending";
  }

  if (reviewer_type === "admin") {
    data.status = "approved";
  }

  return await ProductReview.create(data);
};

/**
 * Get all reviews
 */
export const getAllReviews = async () => {
  return await ProductReview.findAll();
};

/**
 * Get reviews by product ID
 */
export const getReviewsByProductId = async (product_id, includePending = false) => {
  const whereClause = { product_id };
  if (!includePending) whereClause.status = "approved";

  return await ProductReview.findAll({ where: whereClause });
};

/**
 * Update review by ID
 */
export const updateReview = async (id, data) => {
  const review = await ProductReview.findByPk(id);
  if (!review) throw new Error("Review not found");

  return await review.update(data);
};

/**
 * Delete review by ID
 */
export const deleteReview = async (id) => {
  const review = await ProductReview.findByPk(id);
  if (!review) throw new Error("Review not found");

  await review.destroy();
  return true;
};
