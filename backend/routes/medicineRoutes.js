const express = require("express");
const router = express.Router();

const {
    createMedicine,
    getMedicines,
    getMedicineById,
    updateMedicine,
    updateStock,
    deleteMedicine
} = require("../controllers/medicineController");
const { protect, authorizeRoles: authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", authorize("admin", "doctor"), getMedicines);
router.get("/:id", authorize("admin", "doctor"), getMedicineById);

router.post("/", authorize("admin"), createMedicine);
router.put("/:id", authorize("admin"), updateMedicine);
router.patch("/:id/stock", authorize("admin"), updateStock);
router.delete("/:id", authorize("admin"), deleteMedicine);

module.exports = router;