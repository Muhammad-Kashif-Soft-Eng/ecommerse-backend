require("dotenv").config();

const express = require('express');
const app = express();

const connectDB = require('./config/db');
// connectDB(); // 👈 removed: calling it here doesn't wait for it to finish

const cors = require("cors");
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
];
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    // credentials: true
}));

app.use(express.json());

// 👇 new: every request waits for a real DB connection before moving on
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
});

const userRoutes = require("./routes/user.routes");
const errorHandler = require("./middlewares/error.middleware");

app.get("/", (req, res) => {
    return res.json({
        message: "Server is runnings smoothly"
    });
});

app.use("/api/auth", userRoutes);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

module.exports = app; // 👈 new: required so Vercel can use this as a serverless function