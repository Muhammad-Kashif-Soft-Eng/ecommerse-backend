const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

const populateCart = (query) =>
    query.populate({
        path: "items.product",
        select: "productname price image countInStock category",
    });

const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
};

exports.getCart = async (req, res, next) => {
    try {
        const cart = await getOrCreateCart(req.user.id);
        const populated = await populateCart(Cart.findById(cart._id));

        res.status(200).json({
            success: true,
            cart: await populated,
        });
    } catch (error) {
        next(error);
    }
};

exports.addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            const error = new Error("Product ID is required.");
            error.statusCode = 400;
            return next(error);
        }

        const qty = Number(quantity);
        if (isNaN(qty) || qty < 1) {
            const error = new Error("Quantity must be at least 1.");
            error.statusCode = 400;
            return next(error);
        }

        const product = await Product.findById(productId);
        if (!product) {
            const error = new Error("Product not found.");
            error.statusCode = 404;
            return next(error);
        }

        if (product.countInStock < 1) {
            const error = new Error("Product is out of stock.");
            error.statusCode = 400;
            return next(error);
        }

        const cart = await getOrCreateCart(req.user.id);
        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            const newQty = existingItem.quantity + qty;
            if (newQty > product.countInStock) {
                const error = new Error("Not enough stock available.");
                error.statusCode = 400;
                return next(error);
            }
            existingItem.quantity = newQty;
        } else {
            if (qty > product.countInStock) {
                const error = new Error("Not enough stock available.");
                error.statusCode = 400;
                return next(error);
            }
            cart.items.push({ product: productId, quantity: qty });
        }

        await cart.save();
        const populated = await populateCart(Cart.findById(cart._id));

        res.status(200).json({
            success: true,
            message: "Item added to cart.",
            cart: await populated,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateCartItem = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            const error = new Error("Product ID and quantity are required.");
            error.statusCode = 400;
            return next(error);
        }

        const qty = Number(quantity);
        if (isNaN(qty) || qty < 1) {
            const error = new Error("Quantity must be at least 1.");
            error.statusCode = 400;
            return next(error);
        }

        const product = await Product.findById(productId);
        if (!product) {
            const error = new Error("Product not found.");
            error.statusCode = 404;
            return next(error);
        }

        if (qty > product.countInStock) {
            const error = new Error("Not enough stock available.");
            error.statusCode = 400;
            return next(error);
        }

        const cart = await getOrCreateCart(req.user.id);
        const item = cart.items.find(
            (i) => i.product.toString() === productId
        );

        if (!item) {
            const error = new Error("Item not found in cart.");
            error.statusCode = 404;
            return next(error);
        }

        item.quantity = qty;
        await cart.save();

        const populated = await populateCart(Cart.findById(cart._id));

        res.status(200).json({
            success: true,
            message: "Cart updated.",
            cart: await populated,
        });
    } catch (error) {
        next(error);
    }
};

exports.removeFromCart = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const cart = await getOrCreateCart(req.user.id);
        const initialLength = cart.items.length;
        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );

        if (cart.items.length === initialLength) {
            const error = new Error("Item not found in cart.");
            error.statusCode = 404;
            return next(error);
        }

        await cart.save();
        const populated = await populateCart(Cart.findById(cart._id));

        res.status(200).json({
            success: true,
            message: "Item removed from cart.",
            cart: await populated,
        });
    } catch (error) {
        next(error);
    }
};

exports.clearCart = async (req, res, next) => {
    try {
        const cart = await getOrCreateCart(req.user.id);
        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart cleared.",
            cart,
        });
    } catch (error) {
        next(error);
    }
};
