const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = mongoose.model("Post");

const requireLogin = require("../middleware/requireLogin");
router.get("/allpost", requireLogin, (req, res) => {
  Post.find()
    .populate("postedBy", "_id name")
    .then((result) => {
      res.json({ posts: result });
    })
    .catch((err) => {
      console.log(err);
    });
});
router.post("/createpost", requireLogin, (req, res) => {
  const { title, body, photo } = req.body;
  if (!title || !body || !photo) {
    return res.json({ error: "Please enter all the fields" });
  }
  req.user.password = undefined;
  const post = new Post({
    title: title,
    body: body,
    photo: photo,
    postedBy: req.user,
  });
  post
    .save()
    .then((result) => {
      return res.json({ message: "Posted successfully" });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/myposts", requireLogin, (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .then((result) => {
      res.json({ posts: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
