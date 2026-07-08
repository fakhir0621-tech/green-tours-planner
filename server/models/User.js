const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    photo: {
    type: String,
    default: "",
    },
    role: {
      type: String,
      enum: ["traveler", "admin"],
      default: "traveler",
    },

    // ---- MODERATION FIELDS ----
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: "",
    },
    bannedAt: {
      type: Date,
      default: null,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedUntil: {
      type: Date,
      default: null,
    },
    suspendReason: {
      type: String,
      default: "",
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: "",
    },
    flaggedAt: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    moderationNotes: {
      type: String,
      default: "",
    },

    // ---- NEW: PASSWORD RESET FIELDS ----
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpiry: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);