const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getMe,
    logout,
    createUser
} = require("../controllers/authController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
    registerRules,
    loginRules,
    createUserRules
} = require("../middleware/authValidator");;

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);

router.get("/profile", protect, getMe);
router.post("/logout", protect, logout);

router.post(
    "/create-user",
    protect,
    authorizeRoles("admin"),
    createUserRules,
    validate,
    createUser
);

module.exports = router;