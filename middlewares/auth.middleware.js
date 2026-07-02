const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const tokenFromCookie = req.cookies?.token;
        const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        const token = tokenFromCookie || tokenFromHeader;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("role isBlocked");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found."
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked. Contact support."
            });
        }

        req.user = { ...decoded, role: user.role };

        next();

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

module.exports = auth;