const Razorpay = require("razorpay");
const crypto = require("crypto");
const Bill = require("../models/Bill");
const Payment = require("../models/Payment");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const fail = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

// verify aur webhook dono yahi call karte hain; status "created" wala filter ise idempotent banata hai
const settle = async (orderId, paymentId, method) => {
    const payment = await Payment.findOneAndUpdate(
        { orderId, status: "created" },
        { status: "paid", paymentId, method },
        { new: true }
    );
    if (!payment) return; // pehle hi settle ho chuka hai

    const bill = await Bill.findById(payment.bill);
    bill.paidAmount += payment.amount;
    bill.paymentMethod = method;
    await bill.save();
};

// POST /api/payments/create-order   body: { billId, amount? }
exports.createOrder = async (req, res) => {
    try {
        const bill = await Bill.findById(req.body.billId);
        if (!bill) throw fail(404, "Bill not found");
        if (bill.paymentStatus === "cancelled" || bill.paymentStatus === "paid") {
            throw fail(400, "Is bill pe payment nahi ho sakti");
        }

        const due = bill.totalAmount - bill.paidAmount;
        const amount = req.body.amount ? Number(req.body.amount) : due;
        if (!(amount > 0) || amount > due) throw fail(400, `Sirf ₹${due} baaki hai`);

        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // paise
            currency: "INR",
            receipt: bill.billNumber
        });

        await Payment.create({ bill: bill._id, amount, orderId: order.id });

        res.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                billNumber: bill.billNumber
            }
        });
    } catch (error) {
        //  console.log("CREATE ORDER ERROR:", error);
        // console.log("MESSAGE:", error.message);
        // console.log("STATUS:", error.status);

        res.status(error.status || 400).json({ success: false, message: error.message });
    }
};

// POST /api/payments/verify   body: razorpay_order_id, razorpay_payment_id, razorpay_signature
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const expected = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");
        if (expected !== razorpay_signature) throw fail(400, "Signature match nahi hua");

        const p = await razorpay.payments.fetch(razorpay_payment_id);
        await settle(razorpay_order_id, razorpay_payment_id, p.method);

        res.json({ success: true });
    } catch (error) {
        res.status(error.status || 400).json({ success: false, message: error.message });
    }
};

// POST /api/payments/webhook  (no auth, raw body)
exports.webhook = async (req, res) => {
    try {
        const expected = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(req.body)
            .digest("hex");
        if (expected !== req.headers["x-razorpay-signature"]) {
            return res.status(400).send("Invalid signature");
        }

        const event = JSON.parse(req.body.toString());
        if (event.event === "payment.captured") {
            const p = event.payload.payment.entity;
            await settle(p.order_id, p.id, p.method);
        }
        res.json({ received: true });
    } catch (error) {
        res.status(500).send(error.message);
    }
};