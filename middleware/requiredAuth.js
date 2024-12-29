const User = require("../models/user");
const { verifyToken } = require("../utils/common");

exports.requiedAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res
        .status(401)
        .json({ message: "Authorization token is required" });
    }

    const token = authorization.split(" ")[1];

    console.log(token);
    const payload = await verifyToken(token);
    console.log(payload);
    const user = await User.findById(payload.id);
    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};
