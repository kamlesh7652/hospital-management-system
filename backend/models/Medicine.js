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
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Medicine", medicineSchema);