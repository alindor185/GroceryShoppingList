const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Initiate Google OAuth Login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    if (!req.user || !req.user.token) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // ✅ Instead of redirecting immediately, send token as JSON response
    res.json({
      success: true,
      message: "Google login successful",
      token: req.user.token,
      user: req.user.user,
    });

    // Alternative: Redirect with token in URL (ONLY if frontend handles it correctly)
    // res.redirect(`http://localhost:3000/login?token=${req.user.token}`);
  }
);

module.exports = router;
