const Booking = require("../models/Booking");

// ---- CREATE BOOKING WITH PAYMENT ----
const createBooking = async (req, res) => {
  try {
    const {
      user,
      tour,
      travelDate,
      numberOfPeople,
      totalPrice,
      paymentMethod,
      transactionId,
      paymentScreenshot,
    } = req.body;

    // Validate required fields
    if (!user)             return res.status(400).json({ message: "User is required." });
    if (!tour)             return res.status(400).json({ message: "Tour is required." });
    if (!travelDate)       return res.status(400).json({ message: "Travel date is required." });
    if (!numberOfPeople)   return res.status(400).json({ message: "Number of people is required." });
    if (!totalPrice)       return res.status(400).json({ message: "Total price is required." });
    if (!paymentMethod)    return res.status(400).json({ message: "Payment method is required." });
    if (!transactionId)    return res.status(400).json({ message: "Transaction ID is required." });
    if (!paymentScreenshot)return res.status(400).json({ message: "Payment screenshot is required." });

    // Check screenshot size — base64 strings can be huge
    if (paymentScreenshot.length > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "Screenshot too large. Max 5MB." });
    }

    const booking = await Booking.create({
      user,
      tour,
      travelDate,
      numberOfPeople,
      totalPrice,
      paymentMethod,
      transactionId,
      paymentScreenshot,
      status: "Pending",
      paymentStatus: "Pending",
    });

    const populated = await Booking.findById(booking._id)
      .populate("tour", "tourName price duration location images")
      .populate("user", "name email phone");

    res.status(201).json({
      message: "Booking created successfully. Awaiting payment verification.",
      booking: populated,
    });

  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---- GET USER BOOKINGS ----
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId })
      .populate("tour", "tourName price duration location images category")
      .populate("user", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- GET ALL BOOKINGS (admin) ----
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email phone")
      .populate("tour", "tourName price duration location images")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- UPDATE BOOKING STATUS (general) ----
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = req.body.status;
    await booking.save();

    res.status(200).json({ message: "Booking status updated", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- ADMIN VERIFY PAYMENT ----
const verifyPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("tour", "tourName");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const { action, adminNote } = req.body;

    if (action === "approve") {
      booking.paymentStatus = "Verified";
      booking.status = "Confirmed";
      booking.adminNote = adminNote || "Payment verified and approved.";
    } else if (action === "reject") {
      booking.paymentStatus = "Rejected";
      booking.status = "Rejected";
      booking.adminNote = adminNote || "Payment could not be verified.";
    } else {
      return res.status(400).json({ message: "Invalid action. Use approve or reject." });
    }

    await booking.save();

    res.status(200).json({
      message: `Payment ${action === "approve" ? "approved" : "rejected"} successfully.`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- GET SINGLE BOOKING ----
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("tour", "tourName price duration location images category")
      .populate("user", "name email phone");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  verifyPayment,
  getBookingById,
};