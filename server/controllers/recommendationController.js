const Booking = require("../models/Booking");
const Wishlist = require("../models/Wishlist");
const Tour = require("../models/Tour");

const getRecommendations = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Get user's bookings
        const bookings = await Booking.find({ user: userId }).populate("tour");

        // Get user's wishlist
        const wishlist = await Wishlist.find({ user: userId }).populate("tour");

        let preferredLocations = [];
        let preferredCategories = [];

        // Extract preferences from bookings
        bookings.forEach(b => {
            if (b.tour) {
                preferredLocations.push(b.tour.location);
                preferredCategories.push(b.tour.category);
            }
        });

        // Extract preferences from wishlist
        wishlist.forEach(w => {
            if (w.tour) {
                preferredLocations.push(w.tour.location);
                preferredCategories.push(w.tour.category);
            }
        });

        // Remove duplicates
        preferredLocations = [...new Set(preferredLocations)];
        preferredCategories = [...new Set(preferredCategories)];

        // Find similar tours
        const recommendations = await Tour.find({
            $or: [
                { location: { $in: preferredLocations } },
                { category: { $in: preferredCategories } }
            ]
        });

        res.status(200).json({
            preferences: {
                locations: preferredLocations,
                categories: preferredCategories
            },
            recommendations
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getRecommendations
};