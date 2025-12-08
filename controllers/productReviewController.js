// controllers/productReviewController.js
import * as reviewService from "../services/productReviewService.js";

/**
 * Create a new review
 * - User reviews: status will be "pending"
 * - Admin reviews: status will be "approved"
 */
export const createReview = async (req, res) => {
  try {
    const review = await reviewService.createReview(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message }); // 400 for validation or purchase errors
  }
};

/**
 * Get all reviews (for admin dashboard or internal use)
 */
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getAllReviews();
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get reviews by product ID (for public display)
 * - Only approved reviews will be returned
 */
export const getReviewsByProductId = async (req, res) => {
  try {
    const product_id = req.params.product_id;
    const reviews = await reviewService.getReviewsByProductId(product_id);
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update a review by ID
 * - Admin can approve/reject or modify reviews
 */
export const updateReview = async (req, res) => {
  try {
    const review = await reviewService.updateReview(req.params.id, req.body);
    res.status(200).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Delete a review by ID
 */
export const deleteReview = async (req, res) => {
  try {
    await reviewService.deleteReview(req.params.id);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
