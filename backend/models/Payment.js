const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", required: true },
        amount: { type: Number, required: true, min: 1 }, // rupees
        gateway: { type: String, default: "razorpay" },
        orderId: { type: String, required: true, index: true },
        paymentId: { type: String },
        method: { type: String },
        status: { type: String, enum: ["created", "paid", "failed"], default: "created" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);