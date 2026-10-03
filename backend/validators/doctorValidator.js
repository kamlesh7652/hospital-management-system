const { body } = require("express-validator");

const doctorRules = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("phone")
        .optional()
        .matches(/^[0-9+\-\s]{10,15}$/)
        .withMessage("Valid phone number is required"),
    body("specialization").trim().notEmpty().withMessage("Specialization is required"),
    body("consultationFee")
        .isFloat({ min: 0 })
        .withMessage("Consultation fee must be a positive number"),
    body("availableDays")
        .optional()
        .isArray()
        .withMessage("Available days must be a list")
];

module.exports = { doctorRules };