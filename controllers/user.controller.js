const User = require("../models/user.model");

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