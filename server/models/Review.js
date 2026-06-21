const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    // ---- NEW: approval status ----
    // pending = waiting for admin review
    // approved = visible on Home page marquee
    // rejected = hidden from public
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Review", reviewSchema);