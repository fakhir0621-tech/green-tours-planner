const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
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
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Wishlist", wishlistSchema);