const User = require("../models/user.model");
const { sendRegistrationEmail, sendForgotPasswordEmail } = require("../config/nodemailer");
const crypto = require("crypto");

// ================ Register User ================
exports.registerUser = async (req, res, next) => {
    try {
        
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        };

        const existingUser = await User.findOne({ email });
        // while .find() returns array.
        
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exist."
            });
        };
        
        const user = await User.create(req.body);
        
        // Send registration email
        await sendRegistrationEmail(email, username);
        
        return res.status(201).json({
            success: true,
            message: "User registered successfully. Confirmation email sent.",
            user
        });
        
    } catch (err) {
        
        next(err);
        
    };
};

// ================ Login User ================
exports.loginUser = async (req, res, next) => {
    try {
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        };

        const existingUser = await User.findOne({ email });
        // while .find() returns array.
        
        if (!existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email does not exist."
            });
        };
        
        return res.status(200).json({
            success: true,
            message: "User logged in successfully.",
            existingUser
        });
        
    } catch (err) {
        
        next(err);
        
    };
};

// ================ Forgot Password ================
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

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
