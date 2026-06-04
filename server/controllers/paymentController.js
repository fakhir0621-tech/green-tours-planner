const Payment = require("../models/Payment");

const createPayment = async (req, res) => {
    try {
        const {
            user,
            booking,
            amount,
            paymentMethod,
            paymentStatus
        } = req.body;

        const payment = await Payment.create({
            user,
            booking,
            amount,
            paymentMethod,
            paymentStatus
        });

        res.status(201).json({
            message: "Payment recorded successfully",
            payment
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        // Simulate verification logic
        if (payment.paymentStatus === "Completed") {
            return res.status(400).json({
                message: "Payment already verified"
            });
        }

        payment.paymentStatus = "Completed";

        await payment.save();

        res.status(200).json({
            message: "Payment verified successfully",
            payment
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createPayment,
    verifyPayment
};