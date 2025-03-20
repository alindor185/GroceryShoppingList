const express = require("express");
const passport = require("passport"); // ✅ Ensure passport is required
const router = express.Router();

// ✅ Route to initiate Google Login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// ✅ Callback route from Google
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    if (!req.user || !req.user.token) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // ✅ Redirect user to frontend with token
    res.redirect(`http://localhost:3000/login?token=${req.user.token}`);
  }
);

module.exports = router;
