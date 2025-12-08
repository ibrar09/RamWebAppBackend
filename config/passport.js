// backend/utils/googlePassport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto"; // for generating random password

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        // Find existing user
        let user = await User.findOne({ where: { email } });

        if (!user) {
          // Generate random password and hash it
          const randomPassword = crypto.randomBytes(16).toString("hex");
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          // Create new user with active status
          user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "customer",
            status: "active", // <-- Google users automatically active
            verified: true,
          });
        } else if (user.status !== "active") {
          // Optional: activate existing user if pending
          user.status = "active";
          await user.save();
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
          expiresIn: "7d",
        });

        return done(null, { user, token });
      } catch (err) {
        console.error("Google auth error:", err);
        return done(err, null);
      }
    }
  )
);

export default passport;
