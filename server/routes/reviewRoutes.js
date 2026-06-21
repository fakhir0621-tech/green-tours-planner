const express = require("express");
const router = express.Router();

const {
    addReview,
    getTourReviews,
    deleteReview,
    updateReview,
    getAllReviews,
    getApprovedReviews,
    getUserReviews,
    approveReview,
    rejectReview,
} = require("../controllers/reviewController");

// ---- SPECIFIC ROUTES FIRST (before wildcard /:id routes) ----

// Get only approved reviews — Home page marquee
// MUST be before /:tourId or Express catches it as a tourId param
router.get("/approved/public", getApprovedReviews);

// Get all reviews — admin dashboard
router.get("/all", getAllReviews);

// Get reviews by user — Account page My Reviews section
router.get("/user/:userId", getUserReviews);

// Approve a review — admin only
router.put("/approve/:id", approveReview);

// Reject a review — admin only
router.put("/reject/:id", rejectReview);

// Add a new review
router.post("/add", addReview);

// Delete a review
router.delete("/:id", deleteReview);

// Update a review
router.put("/:id", updateReview);

// Get reviews for a specific tour — wildcard MUST be last
router.get("/:tourId", getTourReviews);

module.exports = router;