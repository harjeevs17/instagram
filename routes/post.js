const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = mongoose.model("Post");
mongoose.set("useFindAndModify", false);

const requireLogin = require("../middleware/requireLogin");
router.get("/allpost", requireLogin, (req, res) => {
  Post.find()
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
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
  console.log("backendLL", req.user._id);
  Post.findByIdAndUpdate(
    { _id: req.body.postId },
    {
      $push: { likes: req.body.userid },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      console.log(result.likes.length);
      res.json({ error: err });
    } else {
      res.json({ message: "Liked successfully", likes: result.likes.length });
    }
  });
});

router.put("/unlike", requireLogin, (req, res) => {
  console.log("backendUU", req.user._id);
  Post.findByIdAndUpdate(
    { _id: req.body.postId },
    {
      $pull: { likes: req.body.userid },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      res.json({ error: err });
    } else {
      console.log(result.likes.length);
      res.json({ message: "Unliked successfully", likes: result.likes.length });
    }
  });
});

router.put("/comment", requireLogin, (req, res) => {
  console.log(req.user._id);
  const data = {
    text: req.body.comment,
    postedBy: req.user._id,
  };
  Post.findByIdAndUpdate(
    { _id: req.body.postId },
    {
      $push: { comments: data },
    },
    {
      new: true,
    }
  )
    .populate("comments.postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        res.json({ error: err });
      } else {
        res.json({ message: "Commend added successfully", result: result });
      }
    });
});

module.exports = router;
