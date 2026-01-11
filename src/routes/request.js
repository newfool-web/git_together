const express = require("express");
const { userAuth } = require("../middleware/auth");
const requestRouter = express.Router();
const User = require("../models/user")
const ConnectionRequest = require("../models/connectionRequest")

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req,res)=>{
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type: " + status });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not found!" });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection Request Already Exists!!" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      // const emailRes = await sendEmail.run(
      //   "A new friend request from " + req.user.firstName,
      //   req.user.firstName + " is " + status + " in " + toUser.firstName
      // );
      // console.log(emailRes);

      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
})

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req,res)=>{

  try{
    const loggedInUser = req.user;
    const requestId = req.params.requestId;
    const status = req.params.status;

    //OR
    //const {requestId, status} = req.params;

    const allowedStatus = ["accepted", "rejected"];
    if(!allowedStatus.includes(status)){
      res.status(400).message("Status Not Allowed");
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status : "interested"
    });

    if(!connectionRequest){
      res.status(404).send("Connection Request Not Found");
    }

    connectionRequest.status = status;

    const data = await connectionRequest.save();
    res.status(200).json({
      message:"Connection Requested "+ status
    })
  }
  catch(err){
    res.status(400).send("Error: "+err.message)
  }
})

module.exports = requestRouter;