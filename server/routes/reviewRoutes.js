const express = require("express");
const router = express.Router();

const {
    addReview,
    getTourReviews
} = require("../controllers/reviewController");

router.post("/add", addReview);
router.get("/:tourId", getTourReviews);

module.exports = router;