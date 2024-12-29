const express = require("express");
const {
  getAllUser,
  getUser,
  storeChat,
  getChatHistory,
} = require("../controllers/chat.controller");
const { requiedAuth } = require("../middleware/requiredAuth");
const router = express.Router();

router.get("/getAllUser", getAllUser);

router.get("/getuser/:userId", requiedAuth, getUser);

router.post("/storeChat", storeChat);

router.get("/getChatHistory", getChatHistory);

router.get("/hii", (req, res) => {
  console.log("hii");
  res.send("hi");
});

module.exports = router;
