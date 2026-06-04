const User = require("../models/User");
const Tour = require("../models/Tour");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

const getAdminReport = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTours = await Tour.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const totalPayments = await Payment.countDocuments();

        res.status(200).json({
            totalUsers,
            totalTours,
            totalBookings,
            totalPayments
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getAdminReport
};