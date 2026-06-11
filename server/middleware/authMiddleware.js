const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ---- Verify token and attach user to req ----
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// ---- Block admin from performing customer-only actions ----
const notAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return res.status(403).json({
      message: "Admins cannot perform this customer action. Use the Admin Dashboard instead.",
    });
  }
  next();
};

// ---- Require admin role ----
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access required." });
  }
};

module.exports = { protect, notAdmin, adminOnly };