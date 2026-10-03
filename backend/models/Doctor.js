const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        doctorId: {
            type: String,
            unique: true,
            required: true
        },

        specialization: {
            type: String,
            required: true
        },

        qualification: {
            type: String
        },

        experience: {
            type: Number,
            default: 0,
            min: 0
        },

        consultationFee: {
            type: Number,
            default: 0,
            min: 0
        },

        availableDays: [{
            type: String,
            enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        }]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Doctor", doctorSchema);