const mongoose = require("mongoose");

exports.dbconnect = async () => {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((e) => {
      console.log("Error connecting to MongoDB" + e.message);
    });
};
