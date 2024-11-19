const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.createToken = (_id, email) => {
  const token = jwt.sign(
    { id: _id, email },
    process.env.JWT_SECRET || "thisismypersonalSecret",
    {
      expiresIn: "7d",
    }
  );
  return token;
};

exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "thisismypersonalSecret"
    );
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

exports.getHashedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

exports.comparePasswords = async (enteredPassword, hashedPassword) => {
  const isMatch = await bcrypt.compare(enteredPassword, hashedPassword);
  return isMatch;
};

exports.generateUserId = (userName) => {
  // Ensure the username is at least 4 characters long
  const namePart = userName.substring(0, 4).toLowerCase(); // Extract first 4 chars and convert to lowercase

  // Generate a random 4-digit number
  const randomPart = Math.floor(1000 + Math.random() * 9000); // Generates a random number between 1000 and 9999

  // Combine both parts to form the userId
  const userId = `${namePart}${randomPart}`;

  return userId;
};
