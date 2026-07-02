const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

exports.createOrder = async (req, res, next) => {
    try {
        const { shippingAddress, paymentMethod = "COD" } = req.body;

        if (!shippingAddress) {
            const error = new Error("Shipping address is required.");
            error.statusCode = 400;
            return next(error);
        }

        const requiredFields = ["fullName", "street", "city", "state", "zipCode", "country", "phone"];
        for (const field of requiredFields) {
            if (!shippingAddress[field]?.trim()) {
                const error = new Error(`${field} is required in shipping address.`);
                error.statusCode = 400;
                return next(error);
            }
        }

        const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            const error = new Error("Cart is empty.");
            error.statusCode = 400;
            return next(error);
        }

        const orderItems = [];
        let totalPrice = 0;

        for (const item of cart.items) {
            const product = item.product;
            if (!product) {
                const error = new Error("A product in your cart no longer exists.");
                error.statusCode = 400;
                return next(error);
            }

            if (product.countInStock < item.quantity) {
                const error = new Error(`Insufficient stock for ${product.productname}.`);
                error.statusCode = 400;
                return next(error);
            }

            orderItems.push({
                product: product._id,
                name: product.productname,
                image: product.image,
                price: product.price,
                quantity: item.quantity,
            });

            totalPrice += product.price * item.quantity;
            product.countInStock -= item.quantity;
            await product.save();
        }

        const order = await Order.create({
            user: req.user.id,
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            status: "Pending",
        });

        cart.items = [];
        await cart.save();

        res.status(201).json({
            success: true,
            message: "Order placed successfully.",
            order,
        });
    } catch (error) {
        next(error);
    }
};

exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        next(error);
    }
};

exports.getMyOrderById = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!order) {
            const error = new Error("Order not found.");
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate("user", "username email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        next(error);
    }
};

exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            "user",
            "username email phone"
        );

        if (!order) {
            const error = new Error("Order not found.");
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!status || !ORDER_STATUSES.includes(status)) {
            const error = new Error(`Status must be one of: ${ORDER_STATUSES.join(", ")}`);
            error.statusCode = 400;
            return next(error);
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            const error = new Error("Order not found.");
            error.statusCode = 404;
            return next(error);
        }

        if (order.status === "Delivered" && status !== "Delivered") {
            const error = new Error("Cannot change status of a delivered order.");
            error.statusCode = 400;
            return next(error);
        }

        if (status === "Cancelled" && order.status !== "Pending") {
            const error = new Error("Only pending orders can be cancelled.");
            error.statusCode = 400;
            return next(error);
        }

        if (status === "Cancelled" && order.status === "Pending") {
            for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { countInStock: item.quantity },
                });
            }
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            success: true,
            message: "Order status updated.",
            order,
        });
    } catch (error) {
        next(error);
    }
};
