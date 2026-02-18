const express = require("express");
const connectDB = require("./config/database.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require('http');

dotenv.config();

const app = express();


const basePath = process.env.VERCEL ? "/api" : "/";

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",    
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/user.js");
const chatRouter = require("./routes/chat.js");

const initializeSocket = require("./utils/socket.js");

app.use(basePath, authRouter);
app.use(basePath, profileRouter);
app.use(basePath, requestRouter);
app.use(basePath, userRouter);
app.use(basePath, chatRouter);

const server = http.createServer(app);
initializeSocket(server);

// Only start server when run directly (not on Vercel serverless)
if (!process.env.VERCEL) {
    connectDB()
        .then(() => {
            console.log("Connected to Database");
            server.listen(process.env.PORT || 3000, () => {
                console.log("Server is listening on port", process.env.PORT || 3000);
            });
        })
        .catch((err) => {
            console.log("Failed to connect to Database! " + err.message);
        });
}

module.exports = app;

