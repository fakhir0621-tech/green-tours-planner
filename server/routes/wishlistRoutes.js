const express = require("express");
const router = express.Router();

const {
    addToWishlist,
    getUserWishlist,
    removeFromWishlist
} = require("../controllers/wishlistController");

router.post("/add", addToWishlist);
router.get("/:userId", getUserWishlist);
router.delete("/:id", removeFromWishlist);

module.exports = router;