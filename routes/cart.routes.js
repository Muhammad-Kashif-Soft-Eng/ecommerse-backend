const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} = require("../controllers/cart.controller");

router.use(auth, authorize("customer"));

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/clear", clearCart);
router.delete("/:productId", removeFromCart);

module.exports = router;
