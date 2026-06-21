const Review = require("../models/Review");

// ---- ADD REVIEW ----
const addReview = async (req, res) => {
    try {
        // Support both field name styles from frontend:
        // Old style: { userId, tourId, rating, comment }
        // New style: { user, tour, rating, comment }
        const user    = req.body.user    || req.body.userId;
        const tour    = req.body.tour    || req.body.tourId;
        const rating  = req.body.rating;
        const comment = req.body.comment;

        if (!user)    return res.status(400).json({ message: "User is required." });
        if (!tour)    return res.status(400).json({ message: "Tour is required." });
        if (!rating)  return res.status(400).json({ message: "Rating is required." });
        if (!comment) return res.status(400).json({ message: "Comment is required." });

        const review = await Review.create({
            user,
            tour,
            rating,
            comment,
            status: "pending",
        });

        // Populate before returning so frontend gets full data back
        const populated = await Review.findById(review._id)
            .populate("user", "name email")
            .populate("tour", "tourName location images");

        res.status(201).json({
            message: "Review added successfully. It will appear publicly after admin approval.",
            review: populated,
        });

    } catch (error) {
        console.error("Add review error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// ---- GET REVIEWS FOR A SPECIFIC TOUR ----
const getTourReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ tour: req.params.tourId })
            .populate("user", "-password");

        const totalReviews = reviews.length;
        const averageRating =
            totalReviews > 0
                ? reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews
                : 0;

        res.status(200).json({ totalReviews, averageRating, reviews });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---- GET ALL REVIEWS (admin dashboard) ----
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("user", "name email")
            .populate("tour", "tourName location images")
            .sort({ createdAt: -1 });

        res.status(200).json({ reviews });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---- GET APPROVED REVIEWS ONLY (Home page marquee) ----
const getApprovedReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ status: "approved" })
            .populate("user", "name")
            .populate("tour", "tourName location")
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({ reviews });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---- GET REVIEWS BY USER ID ----
const getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.params.userId })
            .populate("tour", "tourName location images")
            .sort({ createdAt: -1 });

        res.status(200).json({ reviews });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---- APPROVE REVIEW (admin only) ----
const approveReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        review.status = "approved";
        await review.save();

        res.status(200).json({ message: "Review approved — now visible on Home page.", review });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---- REJECT REVIEW (admin only) ----
const rejectReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        review.status = "rejected";
        await review.save();

        res.status(200).json({ message: "Review rejected — hidden from public.", review });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---- DELETE REVIEW ----
const deleteReview = async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---- UPDATE REVIEW ----
const updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        review.rating  = req.body.rating  || review.rating;
        review.comment = req.body.comment || review.comment;
        // Reset to pending when edited — needs re-approval
        review.status = "pending";
        await review.save();

        res.status(200).json({ message: "Review updated. Pending re-approval.", review });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addReview,
    getTourReviews,
    deleteReview,
    updateReview,
    getAllReviews,
    getApprovedReviews,
    getUserReviews,
    approveReview,
    rejectReview,
};