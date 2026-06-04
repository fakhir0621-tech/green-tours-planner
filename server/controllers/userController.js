const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// ---- EXISTING: REGISTER ----
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- EXISTING: LOGIN ----
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {

      // Check if banned
      if (user.isBanned) {
        return res.status(403).json({
          message: `Your account has been banned. Reason: ${user.banReason || "Violation of terms"}`,
        });
      }

      // Check if suspended
      if (user.isSuspended && user.suspendedUntil) {
        const now = new Date();
        if (user.suspendedUntil > now) {
          return res.status(403).json({
            message: `Your account is suspended until ${user.suspendedUntil.toDateString()}. Reason: ${user.suspendReason || "Policy violation"}`,
          });
        } else {
          // Suspension expired — auto-lift
          user.isSuspended = false;
          user.suspendedUntil = null;
          user.suspendReason = "";
          await user.save();
        }
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        message: "Login successful",
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- EXISTING: GET USER PROFILE ----
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- EXISTING: UPDATE USER PROFILE ----
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name    = req.body.name    || user.name;
    user.email   = req.body.email   || user.email;
    user.phone   = req.body.phone   || user.phone;
    user.address = req.body.address || user.address;

    const updatedUser = await user.save();
    res.status(200).json({
      message: "Profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- EXISTING: GET ALL USERS ----
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- EXISTING: DELETE USER ----
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- EXISTING: UPDATE USER ROLE ----
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = req.body.role;
    await user.save();
    res.json({ message: "Role updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// ---- NEW MODERATION FUNCTIONS (added below, nothing changed above) ----
// ============================================================

// BAN USER
const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot ban an admin account." });
    }

    user.isBanned   = true;
    user.banReason  = req.body.reason || "Violation of terms of service";
    user.bannedAt   = new Date();
    user.isSuspended = false;
    user.suspendedUntil = null;
    await user.save();

    res.json({ message: "User banned successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UNBAN USER
const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBanned  = false;
    user.banReason = "";
    user.bannedAt  = null;
    await user.save();

    res.json({ message: "User unbanned successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SUSPEND USER TEMPORARILY
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot suspend an admin account." });
    }

    const { reason, days } = req.body;
    const suspendUntil = new Date();
    suspendUntil.setDate(suspendUntil.getDate() + (Number(days) || 7));

    user.isSuspended    = true;
    user.suspendedUntil = suspendUntil;
    user.suspendReason  = reason || "Temporary suspension";
    user.isBanned       = false;
    await user.save();

    res.json({ message: `User suspended for ${days || 7} days`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UNSUSPEND USER (lift early)
const unsuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isSuspended    = false;
    user.suspendedUntil = null;
    user.suspendReason  = "";
    await user.save();

    res.json({ message: "Suspension lifted", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FLAG USER AS SUSPICIOUS
const flagUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isFlagged  = true;
    user.flagReason = req.body.reason || "Suspicious activity detected";
    user.flaggedAt  = new Date();
    await user.save();

    res.json({ message: "User flagged for review", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UNFLAG USER
const unflagUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isFlagged  = false;
    user.flagReason = "";
    user.flaggedAt  = null;
    await user.save();

    res.json({ message: "Flag removed", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESET USER ACCESS (clear all moderation flags)
const resetUserAccess = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBanned       = false;
    user.banReason      = "";
    user.bannedAt       = null;
    user.isSuspended    = false;
    user.suspendedUntil = null;
    user.suspendReason  = "";
    user.isFlagged      = false;
    user.flagReason     = "";
    user.flaggedAt      = null;
    user.moderationNotes = req.body.notes || "";
    await user.save();

    res.json({ message: "User access fully reset", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE MODERATION NOTES
const updateModerationNotes = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.moderationNotes = req.body.notes || "";
    await user.save();

    res.json({ message: "Notes updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  // existing
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  updateUserRole,
  // new moderation
  banUser,
  unbanUser,
  suspendUser,
  unsuspendUser,
  flagUser,
  unflagUser,
  resetUserAccess,
  updateModerationNotes,
};