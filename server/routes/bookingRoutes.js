const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  verifyPayment,
  getBookingById,
} = require("../controllers/bookingController");

router.post("/create", protect, createBooking);
router.get("/user/:userId", protect, getUserBookings);
router.get("/all", protect, getAllBookings);
router.get("/:id", protect, getBookingById);
router.put("/status/:id", protect, updateBookingStatus);
router.put("/verify/:id", protect, verifyPayment);

module.exports = router;