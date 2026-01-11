const express = require('express');
const { userAuth } = require('../middleware/auth');
const userRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest.js")

//Get all the pending connection request for the LoggedIn User
userRouter.get("/user/requests/received", userAuth, async (req, res)=>{
    try{
         const loggedInUser = req.user;
         const connectionRequest = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
         }).populate("fromUserId", "firstName lastName photoUrl age gender about skills")

         res.status(200).json({
            message: "Data Fetched Successfully",
            data: connectionRequest
         })
    }
    catch(err){
        res.status(400).send("Error: "+ err.messsage)
    }
})

userRouter.get("/user/connections", userAuth, async (req, res)=>{
    try{
        const loggedInUser = req.user;

        const connections = await ConnectionRequest.find({
            $or:[
                {fromUserId : loggedInUser, status: "accepted"},
                {toUserId: loggedInUser, status: "accepted"}
            ]
        })
        .populate("fromUserId", "firstName lastName photoUrl age gender about skills")
        .populate("toUserId", "firstName lastName photoUrl age gender about skills")

        if(!connections){
            res.status(200).send("No Connection Found")
        }
        const data = connections.map((row)=> {
            if(row.fromUserId._id.toString()===loggedInUser._id.toString()){
                return row.toUserId;
            }
            return row.fromUserId;
        });
        res.json({
            data: data
        })
    }
    catch(err){
        res.status(400).send("Error: "+err.message)
    }
})

module.exports = userRouter;