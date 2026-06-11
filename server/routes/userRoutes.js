const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  updateUserRole,
  // existing moderation
  banUser,
  unbanUser,
  suspendUser,
  unsuspendUser,
  flagUser,
  unflagUser,
  resetUserAccess,
  updateModerationNotes,
  // new password reset
  forgotPassword,
  validateResetToken,
  resetPassword,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

// ---- EXISTING ROUTES (untouched) ----
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.get("/profile/:id", getUserProfile);
router.put("/profile/:id", updateUserProfile);
router.get("/all", getAllUsers);
router.delete("/:id", deleteUser);
router.put("/role/:id", updateUserRole);

// ---- EXISTING MODERATION ROUTES (untouched) ----
router.put("/ban/:id",        protect, banUser);
router.put("/unban/:id",      protect, unbanUser);
router.put("/suspend/:id",    protect, suspendUser);
router.put("/unsuspend/:id",  protect, unsuspendUser);
router.put("/flag/:id",       protect, flagUser);
router.put("/unflag/:id",     protect, unflagUser);
router.put("/reset/:id",      protect, resetUserAccess);
router.put("/notes/:id",      protect, updateModerationNotes);

// ---- NEW: PASSWORD RESET ROUTES ----
// Step 1 — user submits email, receives reset link
router.post("/forgot-password", forgotPassword);

// Step 2 — frontend validates token before showing form (GET)
router.get("/reset-password/:token", validateResetToken);

// Step 3 — user submits new password (POST)
router.post("/reset-password/:token", resetPassword);

module.exports = router;