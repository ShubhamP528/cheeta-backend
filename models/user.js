const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  googleAuthId: {
    type: String,
    unique: false,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
  profilePicture: {
    type: String,
    default:
      "https://res.cloudinary.com/dgsjppp4a/image/upload/v1715063684/xeviafw34cp6msw7qmvo.png",
  },
});

module.exports = mongoose.model("User", userSchema);
