const Booking = require("../models/Booking");
const User = require("../models/User");
const Tour = require("../models/Tour");

const getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTours = await Tour.countDocuments();
        const totalBookings = await Booking.countDocuments();

        // Calculate total revenue
        const bookings = await Booking.find();
        const totalRevenue = bookings.reduce((acc, booking) => {
            return acc + (booking.totalPrice || 0);
        }, 0);

        res.status(200).json({
            totalUsers,
            totalTours,
            totalBookings,
            totalRevenue
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = { getAnalytics };