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
module.exports = router;
