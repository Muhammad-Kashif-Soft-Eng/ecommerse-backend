const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-only protected routes
router.use(authMiddleware, authorize("admin"));

router.post("/", upload.single("image"), createProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;