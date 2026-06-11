// ============================================================
// ---- SUPPORT MESSAGE MODEL ----
// Stores contact/support messages from registered users.
// One active (open/pending) message per user at a time.
// ============================================================
const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema(
  {
    // ---- WHO SENT IT ----
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },

    // ---- MESSAGE CONTENT ----
    subject: { type: String, default: "" },
    message: { type: String, required: true },

    // ---- STATUS ----
    // open      = submitted, admin hasn't replied yet
    // replied   = admin has replied, user can read reply
    // closed    = admin closed it (no reply needed)
    // blocked   = user is blocked from sending more messages
    status: {
      type: String,
      enum: ["open", "replied", "closed", "blocked"],
      default: "open",
    },

    // ---- ADMIN REPLY ----
    adminReply: { type: String, default: "" },
    repliedAt:  { type: Date, default: null },
    repliedBy:  { type: String, default: "" }, // admin name

    // ---- SPAM PREVENTION ----
    // isActive = true means user cannot send another message yet
    // Set to false when status becomes "replied" or "closed"
    isActive: { type: Boolean, default: true },

    // ---- USER READ STATUS ----
    // Did the user read the admin's reply?
    userReadReply: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportMessage", supportMessageSchema);