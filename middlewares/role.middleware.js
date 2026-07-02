const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user?.role) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Role not found.",
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions.",
            });
        }

        next();
    };
};

module.exports = authorize;
