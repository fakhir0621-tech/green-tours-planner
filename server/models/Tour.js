const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
{
    tourName: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    duration: {
        type: String
    },

    description: {
        type: String
    },

    category: {
        type: String
    },

    images: [{
        type: String
    }],

    availableSeats: {
        type: Number,
        default: 10
    },

    virtualTourLink: {
        type: String
    },

    rating: {
        type: Number,
        default: 0
    },

    itinerary: [
  {
    day: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }
],

},
{
    timestamps: true
}
);

module.exports = mongoose.model("Tour", tourSchema);