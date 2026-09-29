const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String
        },

        manufacturer: {
            type: String
        },

        price: {
            type: Number,
            required: true
        },

        stock: {
            type: Number,
            default: 0
        },

        expiryDate: {
            type: Date
        },
        batchNumber: {
         type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);
medicineSchema.index({ name: 1, batchNumber: 1 }, { unique: true });

module.exports = mongoose.model("Medicine", medicineSchema);