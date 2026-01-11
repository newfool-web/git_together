const express = require("express");
const profileRouter = express.Router();
const {userAuth} = require("../middleware/auth")
const {validateEditProfileData} = require("../utils/validation")
const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req, res)=>{
    try{
        const user = req.user;
        
        if(!user){
            throw new Error("Invalid User");
        }
        res.status(200).send(user);
    }
    catch(err){
        res.status(400).send("Error: "+ err.message);
    }
})

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfuly`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/edit/password", userAuth, async (req, res)=>{
    try {
        const {oldPassword, newPassword} = req.body;
        
        const loggedInUser = req.user;
        const isPwdValid = await loggedInUser.validatePassword(oldPassword);
        if(!isPwdValid){
            throw new Error("Current Password is Invalid");
        }
        const hashNewPassword = await bcrypt.hash(newPassword,10);
        loggedInUser.password = hashNewPassword;
        await loggedInUser.save();
        res.send(`${loggedInUser.firstName} your Password updated successfully.`)
    } catch (err) {
        res.status(400).send(err.message);
    }
})
module.exports = profileRouter;