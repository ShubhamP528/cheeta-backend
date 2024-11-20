const Chat = require("../models/chat");
const User = require("../models/user");

exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};

exports.getUser = async (req, res) => {
  const userId = req.params.userId;
  const from = req.user.userId;
  try {
    const user = await User.findOne({ userId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const to = user.userId;

    console.log(to, "  ", from);

    const chats = await Chat.find({
      $or: [
        { from: from, to: to },
        { from: to, to: from },
      ],
    });

    return res.json({ user, chats });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};

exports.storeChat = async (req, res) => {
  try {
    const { from, to, message } = req.body;
    const newChat = new Chat({
      from,
      to,
      message,
    });
    await newChat.save();
    return res.json(newChat);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { from, to } = req.body;
    const chats = await Chat.find({
      $or: [
        { from: from, to: to },
        { from: to, from: to },
      ],
      sort: { time: -1 },
    });
    return res.json(chats);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};
