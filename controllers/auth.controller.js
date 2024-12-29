const validator = require("validator");
const User = require("../models/user");
const {
  getHashedPassword,
  createToken,
  comparePasswords,
  verifyToken,
  generateUserId,
} = require("../utils/common");
const { OAuth2Client } = require("google-auth-library");

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!validator.isEmail(email)) {
      return res.status(403).json({ message: "Invalid email" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(403).json({ message: "Password is not enough strong" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(403).json({ message: "Email already exists" });
    }

    const userId = generateUserId(name);

    const hashedPassword = await getHashedPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userId,
    });
    const token = createToken(user._id, email);
    console.log(token);
    return res.json({
      name: user.name,
      email: user.email,
      userId: user._id,
      token,
      username: user.userId,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await comparePasswords(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = createToken(user._id, email);
    return res.json({
      name: user.name,
      email: user.email,
      userId: user._id,
      username: user.userId,
      token,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ error: error.message });
  }
};

exports.getVerify = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    } else {
      return res.status(200).json({ message: "Verified" });
    }
  } catch (error) {
    console.log(error.message);
    return res.json({ error: error.message });
  }
};

exports.googleAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    // create a token
    const token = createToken(user._id, user.email);
    if (process.env.NODE_ENV === "production") {
      console.log("this is a production");
      res.redirect(
        `https://cheeta-chat.netlify.app/?token=${token}&email=${user.email}&name=${user.name}&userId=${user._id}&profilePicture=${user.profilePicture}&username=${user.userId}`
      );
    } else {
      console.log("this is a development");

      res.redirect(
        `http://localhost:3001/?token=${token}&email=${user.email}&name=${user.name}&userId=${user._id}&profilePicture=${user.profilePicture}&username=${user.userId}`
      );
    }

    // res
    //   .status(200)
    //   .json({ email: user.email, name: user.name, token, userId: user._id });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
};

exports.googleAuthCallback = async (req, res) => {
  try {
    const tokenT = req.body.token; // The token sent from the frontend

    if (!tokenT) {
      return res.status(400).json({ message: "Token is missing" });
    }
    const client = new OAuth2Client(process.env.CLIENTID);

    // Verify the Google ID token using OAuth2Client
    const ticket = await client.verifyIdToken({
      idToken: tokenT,
      audience: process.env.CLIENTID, // Your Google OAuth 2.0 Client ID
    });

    const payload = ticket.getPayload(); // Get user info from the token
    const email = payload.email;
    const name = payload.name;
    const profilePicture = payload.picture;
    const googleId = payload.sub; // This is the unique ID from Google
    console.log(payload);

    // Check if the user already exists in the database
    let user;
    user = await User.findOne({
      $or: [{ googleAuthId: googleId }, { email: email }],
    });

    if (!user) {
      const userId = generateUserId(name);

      // If the user doesn't exist, create a new user
      user = new User({
        googleAuthId: googleId,
        name: name,
        email: email,
        profilePicture: profilePicture,
        userId,
      });
    }

    await user.save();

    const token = createToken(user._id, email);
    return res.json({
      name: user.name,
      email: user.email,
      userId: user._id,
      username: user.userId,
      token,
      profilePicture: user.profilePicture,
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
};
