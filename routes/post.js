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

router.put("/like", requireLogin, (req, res) => {
  console.log("backend", req.user._id);
  Post.findByIdAndUpdate(
    { _id: req.body.postId },
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      res.json({ error: err });
    } else {
      res.json({ message: "Liked successfully" });
    }
  });
});

router.put("/unlike", requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    { _id: req.body.postId },
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      res.json({ error: err });
    } else {
      res.json({ message: "Unliked successfully" });
    }
  });
});

module.exports = router;
