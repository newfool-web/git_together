const jwt = require("jsonwebtoken");
const User = require("../models/user")

const userAuth = async (req, res, next) =>{
    try {
        
        const {token} = req.cookies;
 
        if(!token){
            const error = new Error("Please Login Again!");
            error.statusCode = 401;
            throw error;
        }
        const isTokenValid = await jwt.verify(token, process.env.JWT_SECRET);

        const {_id} = isTokenValid;

        const user = await User.findById({_id});
        if(!user){
            throw new Error("User Not Found!");
        }
        req.user = user;
        next();
    } 
    catch (err){
        return res.status(err.statusCode || 400).send("Error: " + err.message);
    }
}

module.exports = {
    userAuth
}



