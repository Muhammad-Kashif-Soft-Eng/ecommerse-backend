require("dotenv").config();

const express = require('express');
const app = express();

const connectDB = require('./config/db');
connectDB();

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
// app.listen(5000, () => {
//     console.log(`Server is running on port 5000`);
//     // console.log(`Server is running on port ${process.env.PORT}`);
// });