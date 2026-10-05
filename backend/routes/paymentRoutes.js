const express = require("express");
const router = express.Router();

const { createOrder, verifyPayment } = require("../controllers/paymentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/create-order", protect, authorizeRoles("admin", "receptionist"), createOrder);
router.post("/verify", protect, authorizeRoles("admin", "receptionist"), verifyPayment);

module.exports = router;