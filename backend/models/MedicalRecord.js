const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },

        diagnosis: {
            type: String,
            required: true
        },

        symptoms: {
            type: String
        },

        treatment: {
            type: String
        },

        prescription: {
            type: String
        },

        notes: {
            type: String
        },
        visitDate: {
            type: Date,
            default: Date.now
        },
        testReports: [
            {
                testName: {
                    type: String,
                    required: true
                },
                result: String,
                reportDate: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "MedicalRecord",
    medicalRecordSchema
);