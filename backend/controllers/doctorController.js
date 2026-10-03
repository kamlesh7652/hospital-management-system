const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

// Doctor ka User account + Doctor profile dono banta hai
const createDoctor = async (req, res) => {
    try {
        const {
            name, email, password, phone,
            specialization, qualification, experience,
            consultationFee, availableDays
        } = req.body;

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
            role: "doctor"
        });

        const count = await Doctor.countDocuments();
        const doctorId = `DOC-${String(count + 1).padStart(4, "0")}`;

        const doctor = await Doctor.create({
            user: user._id,
            doctorId,
            specialization,
            qualification,
            experience,
            consultationFee,
            availableDays
        });

        return res.status(201).json({
            success: true,
            message: "Doctor created successfully",
            data: { ...doctor.toObject(), name: user.name, email: user.email, phone: user.phone }
        });
    } catch (error) {
        console.error("Create Doctor Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate("user", "name email phone isActive")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: doctors });
    } catch (error) {
        console.error("Get Doctors Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate("user", "name email phone isActive");

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        return res.status(200).json({ success: true, data: doctor });
    } catch (error) {
        console.error("Get Doctor Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const updateDoctor = async (req, res) => {
    try {
        const {
            name, phone, specialization, qualification,
            experience, consultationFee, availableDays, isActive
        } = req.body;

        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        if (specialization !== undefined) doctor.specialization = specialization;
        if (qualification !== undefined) doctor.qualification = qualification;
        if (experience !== undefined) doctor.experience = experience;
        if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
        if (availableDays !== undefined) doctor.availableDays = availableDays;
        await doctor.save();

        if (name !== undefined || phone !== undefined || isActive !== undefined) {
            const update = {};
            if (name !== undefined) update.name = name;
            if (phone !== undefined) update.phone = phone;
            if (isActive !== undefined) update.isActive = isActive;
            await User.findByIdAndUpdate(doctor.user, update);
        }

        return res.status(200).json({
            success: true,
            message: "Doctor updated successfully",
            data: doctor
        });
    } catch (error) {
        console.error("Update Doctor Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Hard delete nahi, isActive false karte hain
const deactivateDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        await User.findByIdAndUpdate(doctor.user, { isActive: false });

        return res.status(200).json({
            success: true,
            message: "Doctor deactivated successfully"
        });
    } catch (error) {
        console.error("Deactivate Doctor Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    createDoctor,
    getDoctors,
    getDoctorById,
    updateDoctor,
    deactivateDoctor
};