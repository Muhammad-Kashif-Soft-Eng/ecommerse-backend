const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {

    if (isConnected) return;

    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MongoDB URI is not defined.");
    }

    try {
        await mongoose.connect(mongoUri);
        isConnected = true;
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.log(err);
        throw err;
    }
}
module.exports = connectDB;