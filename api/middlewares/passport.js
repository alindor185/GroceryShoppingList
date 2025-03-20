const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require("dotenv").config(); // ✅ Ensure .env is loaded

const User = require('../models/user'); // Ensure User model is loaded

// ✅ Check if Google credentials are loaded
console.log("Loading Google OAuth Credentials...");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Ensure these are set in .env
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3031/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,  
            email: profile.emails[0].value,
            fullName: profile.displayName,
            image: profile.photos[0].value,
          });

          await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_KEY,
          { expiresIn: '1d' }
        );

        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
