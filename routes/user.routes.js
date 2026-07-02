const express = require("express");
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword, logoutUser, getCurrentUser, updateProfile, changePassword } = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/register", registerUser );
router.post("/login", loginUser );
router.post("/logout", logoutUser );
router.get("/me", auth, getCurrentUser);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;