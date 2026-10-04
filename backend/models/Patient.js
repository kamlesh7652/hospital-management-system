const mongoose = require("mongoose");

// DOB se age nikalne ka helper
const calcAge = (dob) => {
    if (!dob) return undefined;
    const d = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
};

const patientSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        patientId: { type: String, unique: true, required: true },

        dateOfBirth: { type: Date },
        age: { type: Number, min: 0 },          // NEW: auto-calculated

        gender: { type: String, enum: ["male", "female", "other"] },
        bloodGroup: { type: String },
        address: { type: String },
        emergencyContact: { name: String, phone: String, relation: String },
        source: { type: String, enum: ["self", "admin"], default: "admin" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },             // NEW: currentAge response me aaye
        toObject: { virtuals: true },
    }
);

// Hamesha fresh age (birthday ke baad bhi sahi) - DB me store nahi hoti
patientSchema.virtual("currentAge").get(function () {
    return calcAge(this.dateOfBirth);
});

// patientId auto-generate + age auto-set (create / save)
patientSchema.pre("validate", async function () {
    if (this.dateOfBirth) this.age = calcAge(this.dateOfBirth);

    if (this.patientId) return;

    const last = await this.constructor
        .findOne({}, { patientId: 1 })
        .sort({ patientId: -1 });

    const lastNum = last?.patientId ? parseInt(last.patientId.split("-")[1], 10) : 0;
    this.patientId = `PAT-${String((lastNum || 0) + 1).padStart(4, "0")}`;
});

// findByIdAndUpdate / findOneAndUpdate (admin edit) ke liye
patientSchema.pre("findOneAndUpdate", function () {
    const update = this.getUpdate() || {};
    const dob = update.dateOfBirth ?? update.$set?.dateOfBirth;
    if (dob) {
        update.$set = { ...(update.$set || {}), age: calcAge(dob) };
        this.setUpdate(update);
    }
});

module.exports = mongoose.model("Patient", patientSchema);