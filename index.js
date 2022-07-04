const express = require("express");
const mongoose = require("mongoose");
const User = require("./model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("./middleware/auth");

require("dotenv").config();

const app = express();

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

const { MONGO_URI } = process.env;

app.use(express.json());

//middleware
app.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

//register endpoint
app.post("/register", async (req, res) => {
  try {
    //Check if all data is entered
    const { first_name, last_name, email, password } = req.body;
    if (!(first_name && last_name && email && password)) {
      res.status(400).send("All inputs are required");
    }

    //Check if email is repeated
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //if it is not repeated then create user
    encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName: first_name,
      lastName: last_name,
      email,
      password: encryptedPassword,
    });

    //Create token
    const token = jwt.sign(
      { user_ud: user._id, email },
      process.env.TOKEN_KEY,
      { expiresIn: "2h" }
    );

    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

//login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All inputs are required");
    }

    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      user.token = token;

      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

mongoose.connect(MONGO_URI, (err) => {
  if (!err) {
    console.log("DB connected successfully");
  } else {
    console.log(err);
  }
});

app.listen(port, (err) => {
  if (!err) {
    console.log("Server running on PORT 5000");
  } else {
    console.log(err);
  }
});
