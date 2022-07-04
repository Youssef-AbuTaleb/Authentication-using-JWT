const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, uniqure: true },
  password: String,
  token: String,
});

module.exports = mongoose.model("user", userSchema);
