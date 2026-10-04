const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Patient = require("../models/Patient");
const jwt = require("jsonwebtoken");


const register = async (req, res) => {
    try {
        // role yahan jaan-bujhkar nahi liya, public register hamesha patient banata hai
        //const { name, email, password, phone } = req.body;

        const { name, email, password, phone, dateOfBirth, gender } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: "patient"
        });

        // Patient profile bhi banao, warna admin ki patient list me nahi dikhega
        try {
            await Patient.create({
                user: user._id,
                dateOfBirth: dateOfBirth || undefined,
                gender: gender || undefined,
                source: "self",
                createdBy: user._id
            });
        } catch (err) {
            await User.findByIdAndDelete(user._id); // adhoora user na bache
            throw err;
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Register Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is inactive"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                }
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};
// Logged-in user ki details (protect middleware req.user set karta hai)
const getMe = async (req, res) => {
    return res.status(200).json({
        success: true,
        data: req.user
    });
};

// JWT stateless hota hai, isliye token client apne paas se delete karega
const logout = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};

// Sirf admin: doctor / receptionist / pharmacist / admin banane ke liye
const createUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
         if (!role || role === "patient") {
                return res.status(400).json({
                    success: false,
                    message: "Use the patients module to create patients"
                });
            }
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role
        });

        return res.status(201).json({
            success: true,
            message: `${role} created successfully`,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Create User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
    logout,
    createUser
};