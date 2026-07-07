const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    travelDate: {
      type: String,
      required: true,
    },
    numberOfPeople: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Rejected"],
      default: "Pending",
    },
    // ---- PAYMENT FIELDS ----
    paymentMethod: {
      type: String,
      enum: ["easypaisa", "jazzcash", "bank"],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    paymentScreenshot: {
      type: String, // base64 string
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
    adminNote: {
      type: String,
      default: "",
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    /* =====================================================
       NEW — DEPARTURE / SEAT MAP LINKAGE
       Optional fields. Only populated when this booking
       came from the new departure + seat-map flow. Older
       bookings (free-date, guest-count only) simply won't
       have these set, and nothing above is affected.
       ===================================================== */
    departureId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    seatSelections: [
      {
        vehicleNumber: { type: Number, required: true },
        seatNumber: { type: Number, required: true },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate invoice number before saving
bookingSchema.pre("save", async function () {
  if (!this.invoiceNumber) {
    try {
      const count = await mongoose.model("Booking").countDocuments();
      const pad = String(count + 1).padStart(5, "0");
      this.invoiceNumber = `GTP-${new Date().getFullYear()}-${pad}`;
    } catch (err) {
      console.error("Invoice number generation failed:", err.message);
    }
  }
});

module.exports = mongoose.model("Booking", bookingSchema);
