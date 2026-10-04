const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        patientId: {
            type: String,
            unique: true,
            required: true
        },

        dateOfBirth: {
            type: Date
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"]
        },

        bloodGroup: {
            type: String
        },

        address: {
            type: String
        },

        emergencyContact: {
            name: String,
            phone: String,
            relation: String
        },
         source: {
            type: String,
            enum: ["self", "admin"],
            default: "admin"
        },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true
    }
);

// patientId auto-generate: PAT-0001, PAT-0002, ...
// pre("validate") zaroori hai, kyunki "required" check validation ke time hota hai
// Naye mongoose mein async hook ko next nahi milta, isliye next use nahi kiya
patientSchema.pre("validate", async function () {
    if (this.patientId) return;

    const last = await this.constructor
        .findOne({}, { patientId: 1 })
        .sort({ patientId: -1 });

    const lastNum = last?.patientId ? parseInt(last.patientId.split("-")[1], 10) : 0;
    this.patientId = `PAT-${String((lastNum || 0) + 1).padStart(4, "0")}`;
});

module.exports = mongoose.model("Patient", patientSchema);