const validator = require("validator");
const User = require("../models/user");
const {
  getHashedPassword,
  createToken,
  comparePasswords,
  verifyToken,
  generateUserId,
} = require("../utils/common");

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
      usename: user.userId,
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
      usename: user.userId,
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
    if (process.env.production) {
      res.redirect(
        `https://smart-shop-kro.netlify.app/?token=${token}&email=${user.email}&name=${user.name}&userId=${user._id}&profilePicture=${user.profilePicture}&username=${user.userId}`
      );
    } else {
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
