const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const User = mongoose.model("User");
const requireLogin = require("../middleware/requireLogin");
mongoose.set("useFindAndModify", false);

router.get("/userprofile/:id", requireLogin, (req, res) => {
  User.findOne({ _id: req.params.id })
    .select("-password")
    .then((user) => {
      Post.find({ postedBy: req.params.id })
        .populate("postedBy", "_id name")
        .exec((err, posts) => {
          if (err) {
            return res.json({ error: err });
          } else {
            return res.json({ user, posts });
          }
        });
    })
    .catch((err) => {
      return res.json({ error: "User not found" });
    });
});

router.get("/followUser/:followId", requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.params.followId,
    {
      $push: { followers: req.user._id },
    },
    {
      new: true,
    },
    (err, result1) => {
      if (err) {
        return res.json({ error: err });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { following: req.params.followId },
        },
        {
          new: true,
        }
      )
        .then((result2) => {
          res.json({ result1, result2 });
        })
        .catch((err) => {
          res.json({ error: err });
        });
    }
  );
});

router.get("/unfollowUser/:unfollowId", requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.params.unfollowId,
    {
      $pull: { followers: req.user._id },
    },
    {
      new: true,
    },
    (err, result1) => {
      if (err) {
        return res.json({ error: err });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { following: req.params.unfollowId },
        },
        {
          new: true,
        }
      )
        .then((result2) => {
          res.json({ result1, result2 });
        })
        .catch((err) => {
          res.json({ error: err });
        });
    }
  );
});

router.post("/updatePicture", requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { picture: req.body.picture },
    },
    { new: true },
    (err, result) => {
      if (err) {
        return res.json({ error: err });
      }
      return res.json(result);
    }
  );
});

module.exports = router;
