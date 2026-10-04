const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
    {
        billNumber: {
            type: String,
            unique: true
        },

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
                medicine: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Medicine"
                },
                description: {
                    type: String,
                    required: true,
                    trim: true
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1
                },
                // per unit price; line total = quantity * amount
                amount: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paidAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "partially_paid", "paid", "cancelled"],
            default: "pending"
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "card", "upi"]
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

// total, bill number aur status server pe hi set hote hain
billSchema.pre("validate", function (next) {
    if (!this.billNumber) {
        this.billNumber = `BILL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    }

    this.totalAmount = this.items.reduce((sum, it) => sum + it.quantity * it.amount, 0);

    if (this.paidAmount > this.totalAmount) {
        this.invalidate("paidAmount", "Paid amount total se zyada nahi ho sakta");
    }

    if (this.paymentStatus !== "cancelled") {
        if (this.totalAmount > 0 && this.paidAmount >= this.totalAmount) this.paymentStatus = "paid";
        else if (this.paidAmount > 0) this.paymentStatus = "partially_paid";
        else this.paymentStatus = "pending";
    }

    next();
});

module.exports = mongoose.model("Bill", billSchema);