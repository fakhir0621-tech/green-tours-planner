// ============================================================
// ---- SUPPORT MESSAGE ROUTES ----
// ============================================================
const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  submitMessage,
  getUserMessages,
  markReplyRead,
  checkActiveMessage,
  getAllMessages,
  replyToMessage,
  closeMessage,
  blockUserFromMessaging,
  unblockUserFromMessaging,
} = require("../controllers/supportController");

// ---- USER ROUTES (requires login) ----
router.post("/",            protect, submitMessage);        // submit new message
router.get("/my",           protect, getUserMessages);      // get own messages
router.get("/check-active", protect, checkActiveMessage);   // check if has open message
router.put("/read/:id",     protect, markReplyRead);        // mark reply as read

// ---- ADMIN ROUTES ----
router.get("/all",           protect, adminOnly, getAllMessages);
router.put("/reply/:id",     protect, adminOnly, replyToMessage);
router.put("/close/:id",     protect, adminOnly, closeMessage);
router.put("/block/:id",     protect, adminOnly, blockUserFromMessaging);
router.put("/unblock/:id",   protect, adminOnly, unblockUserFromMessaging);

module.exports = router;