const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // await mongoose.connect("mongodb+srv://muhammadkashifsofteng_db_user:L5xX1vlGgmlPvird@cluster0.u6hexty.mongodb.net/ecommerse");
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.log(err);
    }
}
module.exports = connectDB;