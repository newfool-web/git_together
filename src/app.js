const express = require("express");
const connectDB = require("../src/config/database.js");
const cookieParser = require("cookie-parser");
const cors = require("cors")
const app = express();
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
app.use(express.json());
app.use(cookieParser());
const authRouter = require("./routes/auth.js")
const profileRouter = require("./routes/profile.js")
const requestRouter = require("./routes/request.js")
const userRouter = require("./routes/user.js")
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use('/', userRouter);


connectDB()
.then(()=>{
    console.log("Connected to Database");
    app.listen(3000,()=>{
        console.log("Server is Listening on port 3000");
    });
})
.catch((err)=>{
    console.log("Failed to Connect to Database! "+ err.message);
});

