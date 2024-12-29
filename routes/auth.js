const express = require("express");
const {
  signup,
  login,
  getVerify,
  googleAuthCallback,
} = require("../controllers/auth.controller");
const { requiedAuth } = require("../middleware/requiredAuth");
const router = express.Router();
const passport = require("passport");
require("../utils/passports");

router.post("/signup", signup);
router.post("/login", login);
router.post("/getVerify", requiedAuth, getVerify);

// google auth

// Authentication routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://smart-shop-kro.netlify.app/",
    session: false,
  }),
  googleAuthCallback
);

router.post("/google/callback", googleAuthCallback);

module.exports = router;
