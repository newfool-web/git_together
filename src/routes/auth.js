const express = require("express");
const authRouter = express.Router();
const {validateSignUpData} = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req,res)=>{
    try {
        const {firstName, lastName, emailId, password} = req.body;
        validateSignUpData(req);
        const hashPassword = await bcrypt.hash(password,10);     
        const user = new User({
            firstName,
            lastName,
            emailId,
            password:hashPassword,
        });
        
        const savedUser = await user.save();
        const token = await savedUser.getJWT();
        res.cookie("token", token, {
            expires: new Date(Date.now() + 8 * 3600000), //Ye milisec mein value hai so it is 8 hours
        });
        res.status(200).json({
            message: "User Registered Successfully",
            user: {
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
        },
        });

    } catch (err) {
        res.status(err.statusCode || 400).send("Error: " + err.message);
    }
})

authRouter.post("/login", async(req, res)=>{
    const {emailId, password} =req.body;
    try{
        const user = await User.findOne({emailId});
      
        if(!user){
            throw new Error("Invalid Credentials");            
        }
        const ispwdValid= await user.validatePassword(password);
        
        if(!ispwdValid){
            throw new Error("Invalid Credentials");
        }

        const token = await user.getJWT();
                
        res.cookie("token", token, {
            expires: new Date(Date.now() + 8 * 3600000),
             //Ye milisec mein value hai so it is 8 hours
        });
        return res.status(200).json({
            message: "Login Successful",
            user: user
        })

    }
    catch(err){
        res.status(err.statusCode || 400).send("Error:"+ err.message);
    }
})

authRouter.post("/logout", async(req, res)=>{
    //Agar thoda complex application hoga toh yaha pe clean up activity karni padegi jaise ki token ko db se delete karna wagairah
    res.cookie("token", null, {
        expires: new Date(Date.now()),
    });
    res.send("User LoggedOut Successfully");
})

module.exports = authRouter;