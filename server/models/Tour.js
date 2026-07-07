const mongoose = require("mongoose");

/* =========================================================
   Seat Schema
   ========================================================= */
const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: Number,
      required: true,
    },
    vehicleNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "reserved", "booked"],
      default: "available",
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { _id: false }
);

/* =========================================================
   Departure Schema
   ========================================================= */
const departureSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    departureLocation: {
      type: String,
      required: true,
    },

    arrivalLocation: {
      type: String,
      required: true,
    },

    transportType: {
      type: String,
      required: true,
    },

    vehicleCount: {
      type: Number,
      required: true,
      min: 1,
    },

    seatsPerVehicle: {
      type: Number,
      required: true,
      min: 1,
    },

    totalSeats: {
      type: Number,
      default: 0,
    },

    seatMap: [seatSchema],
  },
  { timestamps: true }
);

/* =========================================================
   Tour Schema
   ========================================================= */

const tourSchema = new mongoose.Schema(
  {
    tourName: { type: String, required: true },

    location: { type: String, required: true },

    price: { type: Number, required: true },

    duration: { type: String },

    description: { type: String },

    category: { type: String },

    images: [{ type: String }],

    // Keep for backward compatibility
    availableSeats: {
      type: Number,
      default: 10,
    },

    virtualTourLink: { type: String },

    rating: {
      type: Number,
      default: 0,
    },

    itinerary: [
      {
        day: {
          type: Number,
          required: true,
        },

        description: {
          type: String,
          required: true,
        },
      },
    ],

    // Existing Virtual Tour Scenes
    virtualTourScenes: [
      {
        title: {
          type: String,
          default: "Scene",
        },

        imageUrl: {
          type: String,
          required: true,
        },

        description: {
          type: String,
          default: "",
        },
      },
    ],

    /* =====================================================
       NEW PROFESSIONAL DEPARTURE SYSTEM
       ===================================================== */
    departures: [departureSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tour", tourSchema);