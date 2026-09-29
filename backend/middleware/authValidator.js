const { body } = require("express-validator");

const registerRules = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    body("phone")
        .optional()
        .matches(/^[0-9+\-\s]{10,15}$/)
        .withMessage("Valid phone number is required")
];

const loginRules = [
    body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required")
];

// Admin jab staff banaye
const createUserRules = [
    ...registerRules,
    body("role")
        .isIn(["admin", "doctor", "receptionist", "pharmacist"])
        .withMessage("Role must be admin, doctor, receptionist or pharmacist")
];

module.exports = { registerRules, loginRules, createUserRules };