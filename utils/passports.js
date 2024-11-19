const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user"); // Import the User model
const { generateUserId } = require("./common");
// const { sendWelcomeEmail } = require("../config/nodemailer");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in the database
        let user = await User.findOne({
          $or: [
            { googleAuthId: profile.id },
            { email: profile.emails[0].value },
          ],
        });
        console.log(accessToken);
        console.log(refreshToken);

        if (!user) {
          const userId = generateUserId(profile.displayName);

          // If the user doesn't exist, create a new user
          user = new User({
            googleAuthId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            profilePicture: profile?.photos[0]?.value,
            userId,
          });
          await user.save();

          //   await sendWelcomeEmail({
          //     name: profile.displayName,
          //     email: profile.emails[0].value,
          //   });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
