const express = require("express");
const router = express.Router();

const {
    createBill,
    getBills,
    getBillById,
    addPayment,
    cancelBill
} = require("../controllers/billController");
const { protect, authorizeRoles: authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", authorize("admin", "receptionist"), getBills);
router.get("/:id", authorize("admin", "receptionist"), getBillById);

router.post("/", authorize("admin", "receptionist"), createBill);
router.patch("/:id/pay", authorize("admin", "receptionist"), addPayment);
router.patch("/:id/cancel", authorize("admin"), cancelBill);

module.exports = router;