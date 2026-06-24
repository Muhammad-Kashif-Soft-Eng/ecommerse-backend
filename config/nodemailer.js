const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_SMTP_HOST || "smtp.gmail.com",
    port: process.env.NODEMAILER_SMTP_PORT || 587,
    secure: false, 
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_APP_PASSWORD
    }
});

// Function to send registration email
const sendRegistrationEmail = async (email, username) => {
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: "Welcome to Our E-Commerce Platform!",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Welcome, ${username}! 🎉</h2>
                <p style="color: #666; font-size: 16px;">Thank you for registering with us.</p>
                <p style="color: #666; font-size: 16px;">Your account has been successfully created.</p>
                <p style="color: #666; font-size: 16px;">You can now login with your credentials and start shopping.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">If you did not create this account, please ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Error sending registration email:", error);
        return false;
    }
};

// Function to send forgot password email
const sendForgotPasswordEmail = async (email, resetToken, username) => {
    const resetURL = `${process.env.FRONTEND_RESET_PASSWORD_URL}?token=${resetToken}`;
    
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: "Password Reset Request",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p style="color: #666; font-size: 16px;">Hi ${username},</p>
                <p style="color: #666; font-size: 16px;">We received a request to reset your password. Click the button below to reset it.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetURL}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #666; font-size: 16px;">Or copy and paste this link in your browser:</p>
                <p style="color: #007bff; word-break: break-all;">${resetURL}</p>
                <p style="color: #666; font-size: 16px;"><strong>Note:</strong> This link will expire in 30 minutes.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Error sending forgot password email:", error);
        return false;
    }
};

module.exports = { transporter, sendRegistrationEmail, sendForgotPasswordEmail };
