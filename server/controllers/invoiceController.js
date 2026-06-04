const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

const getInvoice = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId)
            .populate("user", "name email")
            .populate("tour", "tourName price");

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        const payment = await Payment.findOne({
            booking: booking._id
        });

        const invoice = {
            userName: booking.user.name,
            email: booking.user.email,
            tourName: booking.tour.tourName,
            amount: payment ? payment.amount : booking.totalPrice,
            paymentMethod: payment ? payment.paymentMethod : "N/A",
            paymentStatus: payment ? payment.paymentStatus : "Pending",
            bookingId: booking._id,
            date: booking.createdAt
        };

        res.status(200).json(invoice);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getInvoice
};