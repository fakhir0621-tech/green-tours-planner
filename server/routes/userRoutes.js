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
  // new moderation routes
  banUser,
  unbanUser,
  suspendUser,
  unsuspendUser,
  flagUser,
  unflagUser,
  resetUserAccess,
  updateModerationNotes,
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

// ---- NEW MODERATION ROUTES (added below, nothing above changed) ----
router.put("/ban/:id",        protect, banUser);
router.put("/unban/:id",      protect, unbanUser);
router.put("/suspend/:id",    protect, suspendUser);
router.put("/unsuspend/:id",  protect, unsuspendUser);
router.put("/flag/:id",       protect, flagUser);
router.put("/unflag/:id",     protect, unflagUser);
router.put("/reset/:id",      protect, resetUserAccess);
router.put("/notes/:id",      protect, updateModerationNotes);

module.exports = router;