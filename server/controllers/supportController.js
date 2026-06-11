// ============================================================
// ---- SUPPORT MESSAGE CONTROLLER ----
// Handles all support/contact message operations.
// ============================================================
const SupportMessage = require("../models/SupportMessage");
const User = require("../models/User");

// ---- SUBMIT A NEW MESSAGE (user) ----
// Enforces: one active/open message per user at a time.
const submitMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required." });
    }

    const userId = req.user._id;

    // ---- SPAM CHECK: block if user already has an open message ----
    const existing = await SupportMessage.findOne({
      user: userId,
      isActive: true,
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have an open support message. Please wait for admin to reply or close it before sending another.",
        existingMessage: {
          _id: existing._id,
          subject: existing.subject,
          status: existing.status,
          createdAt: existing.createdAt,
        },
      });
    }

    // ---- CHECK IF USER IS SUPPORT-BLOCKED ----
    const blockedMsg = await SupportMessage.findOne({
      user: userId,
      status: "blocked",
    });
    if (blockedMsg) {
      return res.status(403).json({
        message: "You have been blocked from sending support messages. Please contact us directly.",
      });
    }

    const newMessage = await SupportMessage.create({
      user: userId,
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || "",
      message: message.trim(),
      status: "open",
      isActive: true,
    });

    res.status(201).json({
      message: "Support message submitted successfully.",
      supportMessage: newMessage,
    });

  } catch (error) {
    console.error("Support message error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---- GET USER'S OWN MESSAGES ----
const getUserMessages = async (req, res) => {
  try {
    const messages = await SupportMessage.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- MARK REPLY AS READ (user) ----
const markReplyRead = async (req, res) => {
  try {
    const msg = await SupportMessage.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!msg) return res.status(404).json({ message: "Message not found." });

    msg.userReadReply = true;
    await msg.save();
    res.status(200).json({ message: "Marked as read.", supportMessage: msg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- CHECK IF USER HAS AN ACTIVE MESSAGE ----
// Used by Contact page to show/hide the form
const checkActiveMessage = async (req, res) => {
  try {
    const active = await SupportMessage.findOne({
      user: req.user._id,
      isActive: true,
    });
    res.status(200).json({ hasActive: !!active, message: active || null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// ---- ADMIN ACTIONS ----
// ============================================================

// ---- GET ALL MESSAGES (admin) ----
const getAllMessages = async (req, res) => {
  try {
    const messages = await SupportMessage.find()
      .populate("user", "name email role isBanned")
      .sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- ADMIN REPLY ----
const replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply?.trim()) {
      return res.status(400).json({ message: "Reply text is required." });
    }

    const msg = await SupportMessage.findById(req.params.id).populate("user", "name email");
    if (!msg) return res.status(404).json({ message: "Message not found." });

    msg.adminReply = reply.trim();
    msg.repliedAt = new Date();
    msg.repliedBy = req.user.name || "Admin";
    msg.status = "replied";
    msg.isActive = false;      // user can now send a new message
    msg.userReadReply = false; // reset so user sees the new reply

    await msg.save();

    res.status(200).json({
      message: "Reply sent successfully.",
      supportMessage: msg,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- ADMIN CLOSE MESSAGE ----
const closeMessage = async (req, res) => {
  try {
    const msg = await SupportMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found." });

    msg.status = "closed";
    msg.isActive = false; // user can send new message after close
    await msg.save();

    res.status(200).json({ message: "Message closed.", supportMessage: msg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- ADMIN BLOCK USER FROM MESSAGING ----
const blockUserFromMessaging = async (req, res) => {
  try {
    const msg = await SupportMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found." });

    msg.status = "blocked";
    msg.isActive = false;
    await msg.save();

    // Also mark all their other messages as blocked
    await SupportMessage.updateMany(
      { user: msg.user, _id: { $ne: msg._id } },
      { status: "blocked", isActive: false }
    );

    res.status(200).json({ message: "User blocked from messaging.", supportMessage: msg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- ADMIN UNBLOCK USER FROM MESSAGING ----
const unblockUserFromMessaging = async (req, res) => {
  try {
    const msg = await SupportMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found." });

    msg.status = "closed";
    msg.isActive = false;
    await msg.save();

    res.status(200).json({ message: "User unblocked from messaging.", supportMessage: msg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitMessage,
  getUserMessages,
  markReplyRead,
  checkActiveMessage,
  getAllMessages,
  replyToMessage,
  closeMessage,
  blockUserFromMessaging,
  unblockUserFromMessaging,
};