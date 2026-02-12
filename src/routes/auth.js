const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password } = req.body;
    validateSignUpData(req);
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashPassword,
    });
    const userExist = await User.findOne({ emailId });
    if (userExist) {
      throw new Error("User Already Exist");
    }
    const savedUser = await user.save();
    const token = await savedUser.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({
      message: "User Registered Successfully",
      user: savedUser,
    });
  } catch (err) {
    res.status(err.statusCode || 400).send("Error: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  const { emailId, password } = req.body;
  try {
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const ispwdValid = await user.validatePassword(password);

    if (!ispwdValid) {
      throw new Error("Invalid Credentials");
    }

    const token = await user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return res.status(200).json({
      message: "Login Successful",
      user: user,
    });
  } catch (err) {
    res.status(err.statusCode || 400).send(err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  //Agar thoda complex application hoga toh yaha pe clean up activity karni padegi jaise ki token ko db se delete karna wagairah
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.send("User LoggedOut Successfully");
});

module.exports = authRouter;
