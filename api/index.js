/**
 * Vercel serverless entry point.
 * Connects to MongoDB (cached per invocation) and forwards requests to the Express app.
 */
const connectDB = require("../src/config/database.js");
const app = require("../src/app.js");

let dbPromise = null;

function ensureDb() {
    if (!dbPromise) dbPromise = connectDB();
    return dbPromise;
}

module.exports = async (req, res) => {
    await ensureDb();
    return app(req, res);
};
