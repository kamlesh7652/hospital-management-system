const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Token verify karta hai aur req.user set karta hai
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, token missing"
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is inactive"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        const message =
            error.name === "TokenExpiredError"
                ? "Token expired, please login again"
                : "Not authorized, invalid token";

        return res.status(401).json({ success: false, message });
    }
};

// Sirf allowed roles ko aage jaane deta hai
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action"
            });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };