const Wishlist = require("../models/Wishlist");

const addToWishlist = async (req, res) => {
    try {
        const { user, tour } = req.body;

        const alreadyExists = await Wishlist.findOne({
            user,
            tour
        });

        if (alreadyExists) {
            return res.status(400).json({
                message: "Tour already in wishlist"
            });
        }

        const wishlist = await Wishlist.create({
            user,
            tour
        });

        res.status(201).json({
            message: "Added to wishlist successfully",
            wishlist
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getUserWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.find({
            user: req.params.userId
        })
        .populate("tour");

        res.status(200).json(wishlist);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const item = await Wishlist.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Wishlist item not found"
            });
        }

        await Wishlist.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Removed from wishlist successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    addToWishlist,
    getUserWishlist,
    removeFromWishlist
};