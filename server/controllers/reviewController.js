const Review = require("../models/Review");

const addReview = async (req, res) => {
    try {
        const {
            user,
            tour,
            rating,
            comment
        } = req.body;

        const review = await Review.create({
            user,
            tour,
            rating,
            comment
        });

        res.status(201).json({
            message: "Review added successfully",
            review
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getTourReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            tour: req.params.tourId
        })
        .populate("user", "-password");

        const totalReviews = reviews.length;

        const averageRating =
            totalReviews > 0
                ? reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews
                : 0;

        res.status(200).json({
            totalReviews,
            averageRating,
            reviews
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    addReview,
    getTourReviews
};