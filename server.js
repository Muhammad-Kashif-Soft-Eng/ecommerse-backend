require("dotenv").config();

const express = require('express');
const app = express();

const connectDB = require('./config/db');

const cookieParser = require("cookie-parser");

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

app.use(cookieParser());
app.use(express.json());

// every request waits for a real DB connection before moving on
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
const productRoutes = require("./routes/product.routes");
const errorHandler = require("./middlewares/error.middleware");

app.get("/", (req, res) => {
    return res.json({
        message: "Server is runnings smoothly"
    });
});

app.use("/api/auth", userRoutes);
app.use("/api/products", productRoutes);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

module.exports = app; // required so Vercel can use this as a serverless function