const express = require("express");
const router = express.Router();
const Users = require("../models/User");
const _ = require("lodash");
const passport = require("passport");
const { hashPassword, checkHashed } = require("../lib/hashing");
const { isLoggedIn, isLoggedOut } = require("../lib/isLoggedMiddleware");



// SIGNUP
router.post("/signup", async (req, res, next) => {
  const { username, password, campus, course, image } = req.body;

  console.log(username, password, campus, course);

  // Create the user
  const existingUser = await Users.findOne({ username });
  if (!existingUser) {
    const newUser = await Users.create({
      username,
      password: hashPassword(password),
      campus,
      course,
      image
    });
    // Directly login user
    req.logIn(newUser, err => {
      res.json(
        _.pick(req.user, [
          "username",
          "_id",
          "campus",
          "course",
          "createdAt",
          "updatedAt"
        ])
      );
    });
    console.log(username, "registrado");
  } else {
    res.json({ status: "User Exist" });
  }
});

// LOGIN
router.post(
  "/login",
  // isLoggedOut(),
  passport.authenticate("local"),
  (req, res) => {
    // Directly login user
    return res.json(
      _.pick(req.user, ["username", "_id", "createdAt", "updatedAt"])
    );
  }
);

// LOGOUT
router.post("/logout", 
// isLoggedIn(),
async (req, res, next) => {
  if (req.user) {
    req.logout();
    return res.json({ status: "Log out" });
  } else {
    return res
      .status(401)
      .json({ status: "You have to be logged in to logout" });
  }
});

/* EDIT */
router.post("/edit", isLoggedIn(), async (req, res, next) => {
  try {
    const id = req.user._id;
    const { username, campus, course } = req.body;
    await Users.findByIdAndUpdate(id, {
      username,
      campus,
      course
    });
    return res.json({ status: "Edit Profile" });
  } catch (error) {
    return res.status(401).json({ status: "Not Found" });
  }
});

// WHOAMI
router.post("/whoami", (req, res, next) => {
  if (req.user)
    return res.json(
      _.pick(req.user, [
        "username",
        "_id",
        "campus",
        "course",
        "createdAt",
        "updatedAt"
      ])
    );
  else return res.status(401).json({ status: "No user session present" });
});

module.exports = router;