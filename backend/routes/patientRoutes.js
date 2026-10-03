const express = require("express");
const router = express.Router();

const {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    setPatientStatus,
    getMyProfile
} = require("../controllers/patientController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { createPatientRules, updatePatientRules } = require("../validators/patientValidator");

// '/me' ko hamesha '/:id' se pehle rakhein
router.get("/me", protect, authorizeRoles("patient"), getMyProfile);

// List: admin, receptionist, doctor (doctor ko sirf apne patients dikhte hain)
router.get("/", protect, authorizeRoles("admin", "receptionist", "doctor"), getPatients);
router.get("/:id", protect, authorizeRoles("admin", "receptionist", "doctor", "patient"), getPatientById);

router.post("/", protect, authorizeRoles("admin", "receptionist"), createPatientRules, validate, createPatient);
router.put("/:id", protect, authorizeRoles("admin", "receptionist", "patient"), updatePatientRules, validate, updatePatient);
router.patch("/:id/status", protect, authorizeRoles("admin"), setPatientStatus);

module.exports = router;