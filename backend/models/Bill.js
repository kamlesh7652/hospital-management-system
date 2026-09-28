const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment"
        },

        items: [
            {
                description: String,
                quantity: {
                    type: Number,
                    default: 1
                },
                amount: {
                    type: Number,
                    required: true
                }
            }
        ],

        totalAmount: {
            type: Number,
            required: true
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "cancelled"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Bill", billSchema);