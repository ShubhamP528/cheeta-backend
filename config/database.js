const mongoose = require("mongoose");

exports.dbconnect = async () => {
  mongoose
    .connect(
      "mongodb+srv://shubham528prajapati:4BOoY1M7K5rrPr3M@cluster0.7cflh58.mongodb.net/Cheeta?retryWrites=true&w=majority"
    )
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((e) => {
      console.log("Error connecting to MongoDB" + e.message);
    });
};
