const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const {
    createOrder,
    getMyOrders,
    getMyOrderById,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
} = require("../controllers/order.controller");

// Customer routes
router.post("/", auth, authorize("customer"), createOrder);
router.get("/my", auth, authorize("customer"), getMyOrders);
router.get("/my/:id", auth, authorize("customer"), getMyOrderById);

// Admin routes
router.get("/", auth, authorize("admin"), getAllOrders);
router.get("/:id", auth, authorize("admin"), getOrderById);
router.patch("/:id/status", auth, authorize("admin"), updateOrderStatus);

module.exports = router;
