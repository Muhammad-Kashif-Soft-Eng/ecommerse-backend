const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const {
    getAllCustomers,
    getCustomerById,
    toggleBlockCustomer,
} = require("../controllers/user.controller");

router.use(auth, authorize("admin"));

router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.patch("/:id/toggle-block", toggleBlockCustomer);

module.exports = router;
