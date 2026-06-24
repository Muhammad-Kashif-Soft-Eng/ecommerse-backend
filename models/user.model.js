const mongoose = require("mongoose");

const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        minlength: 3,
        maxlength: 30
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 8,
        select: false
    },

    resetPasswordToken: {
        type: String,
        default: null
    },

    resetPasswordExpiry: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const SALT_ROUNDS = 10;
    this.password = await bcryptjs.hash(this.password, SALT_ROUNDS);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs.compare(candidatePassword, this.password);
}

module.exports = mongoose.model("User", userSchema);