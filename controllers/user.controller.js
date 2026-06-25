const User = require("../models/user.model");
const { sendRegistrationEmail, sendForgotPasswordEmail } = require("../config/nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// ================ Register User ================
exports.registerUser = async (req, res, next) => {
    try {

        const { username, password } = req.body;
        const userEmail = req.body.email;

        if (!username || !userEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        };

        const email = userEmail?.trim().toLowerCase();

        const existingUser = await User.findOne({ email });
        // while .find() returns array.

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exist."
            });
        };

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        const user = await User.create({
            username,
            email,
            password
        });

        const userResponse = user.toObject();
        delete userResponse.password;

        // Send registration email
        try {
            await sendRegistrationEmail(email, username);
        } catch (err) {
            console.error(err);
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully. Confirmation email sent.",
            user: userResponse
        });

    } catch (err) {

        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already exists."
            });
        }

        next(err);

    };
};

// ================ Login User ================
exports.loginUser = async (req, res, next) => {
    try {

        const userEmail = req.body.email;
        const { password } = req.body;

        if (!userEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        };

        const email = userEmail?.trim().toLowerCase();

        const existingUser = await User.findOne({ email }).select("+password");
        // while .find() returns array.

        if (!existingUser) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials."
            });
        };

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        const isMatch = await existingUser.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials."
            });
        };

        const userResponse = existingUser.toObject();
        delete userResponse.password;

        const token = jwt.sign(     // encoded token
            { id: existingUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully.",
            user: userResponse
        });

    } catch (err) {

        next(err);

    };
};

// ================ Forgot Password ================
exports.forgotPassword = async (req, res, next) => {
    try {

        const userEmail = req.body.email;

        if (!userEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const email = userEmail?.trim().toLowerCase();

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User with this email does not exist."
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

        // Set token and expiry (30 minutes)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpiry = Date.now() + 30 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        // Send email
        const emailSent = await sendForgotPasswordEmail(email, resetToken, user.username);

        if (!emailSent) {
            user.resetPasswordToken = null;
            user.resetPasswordExpiry = null;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: "Error sending password reset email. Please try again."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password reset email sent successfully. Check your inbox."
        });

    } catch (err) {
        next(err);
    }
};

// ================ Reset Password ================
exports.resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Token, password, and confirm password are required."
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long."
            });
        }

        // Hash the token to match with database
        const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token."
            });
        }

        // Update password and clear reset token
        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpiry = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now login with your new password."
        });

    } catch (err) {
        next(err);
    }
};


// ================ Logout ================
exports.logoutUser = async (req, res, next) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully."
        });
    } catch (err) {
        next(err);
    }
};