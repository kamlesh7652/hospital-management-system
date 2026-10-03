const express = require("express");
const router = express.Router();

const {
    createDoctor,
    getDoctors,
    getDoctorById,
    updateDoctor,
    deactivateDoctor
} = require("../controllers/doctorController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { doctorRules } = require("../validators/doctorValidator");

// Sabko list/detail dekhne do (login required), CRUD sirf admin
router.get("/", protect, getDoctors);
router.get("/:id", protect, getDoctorById);

router.post("/", protect, authorizeRoles("admin"), doctorRules, validate, createDoctor);
router.put("/:id", protect, authorizeRoles("admin"), updateDoctor);
router.delete("/:id", protect, authorizeRoles("admin"), deactivateDoctor);

module.exports = router;