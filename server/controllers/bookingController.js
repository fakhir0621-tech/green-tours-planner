const Booking = require("../models/Booking");
const Tour = require("../models/Tour");

/* =========================================================
   NEW — SEAT MAP HELPER
   Given a tour, departureId, and seatSelections array,
   updates each matching seat's status in that departure's
   seatMap. Used by createBooking (-> "reserved" + bookingId)
   and verifyPayment (-> "booked" or back to "available").
   Returns true if all seats were found & updated, false if
   any seat couldn't be located (caller decides how to react).
   ========================================================= */
const applySeatStatus = (tour, departureId, seatSelections, status, bookingId, userId) => {
  if (!departureId || !Array.isArray(seatSelections) || seatSelections.length === 0) {
    return true; // nothing to do — old-style booking without seat map
  }

  const departure = tour.departures.id(departureId);
  if (!departure) return false;

  let allFound = true;
  seatSelections.forEach(({ vehicleNumber, seatNumber }) => {
    const seatDoc = departure.seatMap.find(
      s => s.vehicleNumber === vehicleNumber && s.seatNumber === seatNumber
    );
    if (!seatDoc) {
      allFound = false;
      return;
    }
    seatDoc.status = status;
    if (status === "booked") {
      seatDoc.bookedBy = userId || seatDoc.bookedBy;
      seatDoc.bookingId = bookingId || seatDoc.bookingId;
    } else if (status === "available") {
      seatDoc.bookedBy = null;
      seatDoc.bookingId = null;
    } else if (status === "reserved") {
      seatDoc.bookedBy = userId || seatDoc.bookedBy;
      seatDoc.bookingId = bookingId || seatDoc.bookingId;
    }
  });

  return allFound;
};

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
      departureId,        // NEW — optional
      seatSelections,      // NEW — optional, [{ vehicleNumber, seatNumber }]
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

    // NEW — if this booking references a departure/seats, verify those
    // seats are still reserved (held by bookSeats) before proceeding
    let tourDoc = null;
    if (departureId && Array.isArray(seatSelections) && seatSelections.length > 0) {
      tourDoc = await Tour.findById(tour);
      if (!tourDoc) return res.status(404).json({ message: "Tour not found." });

      const departure = tourDoc.departures.id(departureId);
      if (!departure) return res.status(404).json({ message: "Departure not found." });

      const invalidSeats = [];
      for (const sel of seatSelections) {
        const seatDoc = departure.seatMap.find(
          s => s.vehicleNumber === sel.vehicleNumber && s.seatNumber === sel.seatNumber
        );
        if (!seatDoc || seatDoc.status !== "reserved") {
          invalidSeats.push(sel);
        }
      }
      if (invalidSeats.length > 0) {
        return res.status(409).json({
          message: "Some selected seats are no longer reserved. Please reselect your seats.",
          invalidSeats,
        });
      }
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
      departureId: departureId || null,
      seatSelections: Array.isArray(seatSelections) ? seatSelections : [],
    });

    // NEW — tag the reserved seats with this bookingId (status stays "reserved"
    // until admin approves/rejects payment)
    if (tourDoc && departureId && Array.isArray(seatSelections) && seatSelections.length > 0) {
      applySeatStatus(tourDoc, departureId, seatSelections, "reserved", booking._id, user);
      await tourDoc.save();
    }

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

    // NEW — sync seat statuses on the Tour's departure based on the
    // approve/reject decision. Approve -> "booked", Reject -> "available".
    if (booking.departureId && Array.isArray(booking.seatSelections) && booking.seatSelections.length > 0) {
      const tourDoc = await Tour.findById(booking.tour._id || booking.tour);
      if (tourDoc) {
        const newStatus = action === "approve" ? "booked" : "available";
        applySeatStatus(tourDoc, booking.departureId, booking.seatSelections, newStatus, booking._id, booking.user._id || booking.user);
        await tourDoc.save();
      }
    }

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
