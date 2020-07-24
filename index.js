const express = require("express");
const app = express();
const PORT = 5000;
const mongoose = require("mongoose");
var cors = require("cors");
const { MONGOURI } = require("./keys");

/*Mongo connection*/
mongoose.connect(MONGOURI, {
  useNewUrlParser: "true",
  useUnifiedTopology: "true",
});
mongoose.connection.on("connected", () => {
  console.log("Connected successfully");
});
mongoose.connection.on("error", (err) => {
  console.log("There was an error", err);
});
app.use(cors());
/*Mongo connection end*/
require("./models/user");
require("./models/post");
app.use(express.json()); // this will accept json values
app.use(require("./routes/auth"));
app.use(require("./routes/post"));
app.use(require("./routes/user"));
/*Middleware*/
const middleware = (req, res, next) => {
  console.log("This is the middle for about");
  next();
};
/*Middleware*/
//app.use(middleware) this middleware will be executed for all routes
app.get("/", (req, res) => {
  console.log("This is the main");
  res.send("hi");
});
app.get("/about-us", middleware, (req, res) => {
  console.log("This is the middle");
  res.send("About us");
});

/*Listen*/
app.listen(PORT, () => {
  console.log("Listening to port", PORT);
});
