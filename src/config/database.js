const mongoose = require("mongoose");

const connectDB = async () =>{    
    await mongoose.connect("mongodb+srv://achyut10gupta_db_user:12345678-a@cluster0.0itegxr.mongodb.net/dev-Tinder?appName=Cluster0")
}

module.exports = connectDB;

