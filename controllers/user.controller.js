const User = require("../models/user.model");

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
        
        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
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
