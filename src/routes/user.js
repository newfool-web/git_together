const express = require('express');
const { userAuth } = require('../middleware/auth');
const userRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest.js")
const User = require("../models/user.js")

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

userRouter.get("/user/feed", userAuth, async (req, res)=>{

    //User should see all the cards except:
    //1. His own card
    //2. His connections (Status: Accepted)
    //3. Already send connection req(status: interested)
    //4. Ignored peoples (Status: Ignored)
    //5. Rejected People(Status: Rejected)
    //Means ek tarah se aisa ho gya ki agar connectionRequest document(db) mein entry 
    // ho gyi toh wo undono ko feed mein nhi dikhna chahiye. Mtlb fromUserId 
    // ya toUserId mein loggedinUser nhi hona chahiye.
    try{
        const loggedInUser = req.user;
        let limit = parseInt(req.query.limit)||10;
        limit = limit>50?50:limit
        const page = parseInt(req.query.page) ||1;
        const skip = (page-1)*limit


        const connectionRequest = await ConnectionRequest.find({
            $or:[
                {fromUserId: loggedInUser._id},
                {toUserId: loggedInUser._id}
            ]
        }).select("fromUserId toUserId")

        console.log(connectionRequest)

        const hideUsersFromFeed = new Set();
        connectionRequest.forEach((req)=>{
            hideUsersFromFeed.add(req.fromUserId.toString())
            hideUsersFromFeed.add(req.toUserId.toString())
        })

        const users = await User.find({
            $and: [
                {_id: {$nin: Array.from(hideUsersFromFeed)}},
                {_id: {$ne: loggedInUser._id}}
            ]
        }).select("firstName lastName photoUrl age gender about skills").skip(skip).limit(limit)
        res.json({
            data: users
        })
    }
    catch(err){
        res.status(400).json({message: "Error: "+err.message})
    }
})

module.exports = userRouter;