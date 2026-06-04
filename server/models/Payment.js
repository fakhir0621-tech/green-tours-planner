const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    paymentMethod: {
        type: String,
        enum: ["Card", "JazzCash", "EasyPaisa", "Bank Transfer"],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending"
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Payment", paymentSchema);