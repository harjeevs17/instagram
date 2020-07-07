const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../keys");
const requireLogin = require("../middleware/requireLogin");
router.get("/", (req, res) => {
  res.send("Home page");
});

router.get("/protected", requireLogin, (req, res) => {
  res.send("This is the protected area");
});

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(422).json({ error: "Please enter all fields" });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({ error: "User exists with this email" });
      }
      bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new User({
          name: name,
          email: email,
          password: hashedPassword,
        });
        user
          .save()
          .then((user) => {
            return res.json({ message: "User Inserted" });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
  //res.json({ message: "successfully posted" });
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ message: "Enter the given fields" });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (!savedUser) {
        return res.status(422).json({ error: "Given email is not registered" });
      }
      bcrypt
        .compare(password, savedUser.password)
        .then((matched) => {
          if (!matched) {
            return res.status(422).json({ error: "Password did not match" });
          } else {
            /*res.json({ message: "User logged in" });
            return savedUser;*/
            const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
            res.json({ token: token });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
