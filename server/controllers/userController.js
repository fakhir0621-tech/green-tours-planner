const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// ---- EXISTING: REGISTER ----
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, phone });
    res.status(201).json({ message: "User registered successfully", user });
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
      if (user.isBanned) {
        return res.status(403).json({
          message: `Your account has been banned. Reason: ${user.banReason || "Violation of terms"}`,
        });
      }
      if (user.isSuspended && user.suspendedUntil) {
        const now = new Date();
        if (user.suspendedUntil > now) {
          return res.status(403).json({
            message: `Your account is suspended until ${user.suspendedUntil.toDateString()}. Reason: ${user.suspendReason || "Policy violation"}`,
          });
        } else {
          user.isSuspended = false;
          user.suspendedUntil = null;
          user.suspendReason = "";
          await user.save();
        }
      }
      user.lastLogin = new Date();
      await user.save();
res.json({
  message: "Login successful",
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  photo: user.photo,
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

    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    // NEW
    user.photo = req.body.photo || user.photo;

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
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

// ---- EXISTING: MODERATION — BAN ----
const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Cannot ban an admin account." });
    user.isBanned = true;
    user.banReason = req.body.reason || "Violation of terms of service";
    user.bannedAt = new Date();
    user.isSuspended = false;
    user.suspendedUntil = null;
    await user.save();
    res.json({ message: "User banned successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- EXISTING: MODERATION — UNBAN ----
const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isBanned = false;
    user.banReason = "";
    user.bannedAt = null;
    await user.save();
    res.json({ message: "User unbanned successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- EXISTING: MODERATION — SUSPEND ----
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Cannot suspend an admin account." });
    const { reason, days } = req.body;
    const suspendUntil = new Date();
    suspendUntil.setDate(suspendUntil.getDate() + (Number(days) || 7));
    user.isSuspended = true;
    user.suspendedUntil = suspendUntil;
    user.suspendReason = reason || "Temporary suspension";
    user.isBanned = false;
    await user.save();
    res.json({ message: `User suspended for ${days || 7} days`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- EXISTING: MODERATION — UNSUSPEND ----
const unsuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isSuspended = false;
    user.suspendedUntil = null;
    user.suspendReason = "";
    await user.save();
    res.json({ message: "Suspension lifted", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- EXISTING: MODERATION — FLAG ----
const flagUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isFlagged = true;
    user.flagReason = req.body.reason || "Suspicious activity detected";
    user.flaggedAt = new Date();
    await user.save();
    res.json({ message: "User flagged for review", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- EXISTING: MODERATION — UNFLAG ----
const unflagUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isFlagged = false;
    user.flagReason = "";
    user.flaggedAt = null;
    await user.save();
    res.json({ message: "Flag removed", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- EXISTING: MODERATION — RESET ACCESS ----
const resetUserAccess = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isBanned = false; user.banReason = ""; user.bannedAt = null;
    user.isSuspended = false; user.suspendedUntil = null; user.suspendReason = "";
    user.isFlagged = false; user.flagReason = ""; user.flaggedAt = null;
    user.moderationNotes = req.body.notes || "";
    await user.save();
    res.json({ message: "User access fully reset", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- EXISTING: MODERATION — UPDATE NOTES ----
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

// ============================================================
// ---- NEW: FORGOT PASSWORD ----
// POST /api/users/forgot-password
// ============================================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success even if email not found — security best practice
    // (prevents email enumeration attacks)
    if (!user) {
      return res.status(200).json({
        message: "If this email exists in our system, a reset link has been sent.",
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving to DB (raw token goes in email link)
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save hashed token + expiry (1 hour from now) to user
    user.resetPasswordToken  = hashedToken;
    user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Build reset URL with raw token
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Email HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">
          
          <!-- HEADER -->
          <div style="background:linear-gradient(135deg,#14532d,#052e16);padding:36px 40px;text-align:center;">
            <div style="font-size:36px;margin-bottom:12px;">🌿</div>
            <h1 style="color:white;font-size:22px;font-weight:700;margin:0;font-family:Georgia,serif;">
              GreenTours Planner
            </h1>
            <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:6px 0 0;">
              Password Reset Request
            </p>
          </div>

          <!-- BODY -->
          <div style="padding:36px 40px;">
            <h2 style="font-size:20px;font-weight:700;color:#1f2937;margin:0 0 12px;">
              Reset Your Password 🔑
            </h2>
            <p style="font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 8px;">
              Hi <strong>${user.name || "there"}</strong>,
            </p>
            <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 28px;">
              We received a request to reset the password for your GreenTours account. 
              Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
            </p>

            <!-- BUTTON -->
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${resetURL}" 
                style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:white;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:600;text-decoration:none;box-shadow:0 4px 14px rgba(22,163,74,0.35);">
                🔒 Reset My Password
              </a>
            </div>

            <!-- FALLBACK URL -->
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:24px;">
              <p style="font-size:12px;color:#9ca3af;margin:0 0 6px;">
                If the button doesn't work, copy and paste this link:
              </p>
              <p style="font-size:12px;color:#16a34a;word-break:break-all;margin:0;">
                ${resetURL}
              </p>
            </div>

            <!-- SECURITY NOTE -->
            <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
              <p style="font-size:13px;color:#92400e;margin:0;line-height:1.6;">
                ⚠️ <strong>Didn't request this?</strong> You can safely ignore this email. 
                Your password will not change unless you click the link above.
              </p>
            </div>

            <p style="font-size:13px;color:#9ca3af;margin:0;">
              This link will expire in <strong>1 hour</strong> for your security.
            </p>
          </div>

          <!-- FOOTER -->
          <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">
              © ${new Date().getFullYear()} GreenTours Planner · Pakistan's Premier Travel Platform
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: "🔑 Reset Your GreenTours Password",
      html,
    });

    res.status(200).json({
      message: "If this email exists in our system, a reset link has been sent.",
    });

  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({ message: "Failed to send reset email. Please try again." });
  }
};

// ============================================================
// ---- NEW: VALIDATE RESET TOKEN (GET) ----
// GET /api/users/reset-password/:token
// ============================================================
const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the incoming raw token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpiry: { $gt: Date.now() }, // not expired
    });

    if (!user) {
      return res.status(400).json({
        valid: false,
        message: "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    res.status(200).json({ valid: true, message: "Token is valid." });

  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
};

// ============================================================
// ---- NEW: RESET PASSWORD (POST) ----
// POST /api/users/reset-password/:token
// ============================================================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Hash incoming token to find matching user
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpiry: { $gt: Date.now() }, // must not be expired
    });

    if (!user) {
      return res.status(400).json({
        message: "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    // Hash new password and save
    user.password = await bcrypt.hash(password, 10);

    // Invalidate token — can never be reused
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    // Send confirmation email
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">
          <div style="background:linear-gradient(135deg,#14532d,#052e16);padding:32px 36px;text-align:center;">
            <div style="font-size:32px;margin-bottom:10px;">🌿</div>
            <h1 style="color:white;font-size:20px;font-weight:700;margin:0;font-family:Georgia,serif;">GreenTours Planner</h1>
          </div>
          <div style="padding:32px 36px;">
            <h2 style="font-size:20px;color:#1f2937;margin:0 0 16px;">✅ Password Changed Successfully</h2>
            <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 20px;">
              Hi <strong>${user.name || "there"}</strong>, your password has been reset successfully. 
              You can now sign in with your new password.
            </p>
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;">
              <p style="font-size:13px;color:#dc2626;margin:0;line-height:1.6;">
                🚨 If you did NOT make this change, please contact support immediately.
              </p>
            </div>
          </div>
          <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 36px;text-align:center;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">© ${new Date().getFullYear()} GreenTours Planner</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: "✅ Your GreenTours Password Was Reset",
      html,
    });

    res.status(200).json({ message: "Password reset successfully. You can now log in." });

  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({ message: "Failed to reset password. Please try again." });
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
};