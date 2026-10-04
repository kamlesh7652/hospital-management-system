const Bill = require("../models/Bill");
const Medicine = require("../models/Medicine");
const Patient = require("../models/Patient");

const fail = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

const restoreStock = async (items) => {
    for (const it of items) {
        if (it.medicine) {
            await Medicine.findByIdAndUpdate(it.medicine, { $inc: { stock: it.quantity } });
        }
    }
};

// stock ek-ek karke kam hota hai; beech mein fail ho to jo kam hua wo wapas
const deductStock = async (items) => {
    const done = [];
    try {
        for (const it of items) {
            if (!it.medicine) continue;
            const updated = await Medicine.findOneAndUpdate(
                { _id: it.medicine, stock: { $gte: it.quantity } },
                { $inc: { stock: -it.quantity } }
            );
            if (!updated) throw fail(400, `Stock kam hai: ${it.description}`);
            done.push(it);
        }
    } catch (err) {
        await restoreStock(done);
        throw err;
    }
};

// medicine items ka naam aur price server se aata hai (client ka price trust nahi karte)
const prepareItems = async (items) => {
    const prepared = [];
    for (const it of items) {
        const quantity = Number(it.quantity) || 1;
        if (it.medicine) {
            const med = await Medicine.findById(it.medicine);
            if (!med) throw fail(404, "Medicine not found");
            if (med.expiryDate && med.expiryDate < new Date()) {
                throw fail(400, `${med.name} expire ho chuki hai`);
            }
            prepared.push({
                medicine: med._id,
                description: `${med.name} (Batch ${med.batchNumber})`,
                quantity,
                amount: med.price
            });
        } else {
            if (!it.description || !(Number(it.amount) >= 0)) {
                throw fail(400, "Har item mein description aur amount chahiye");
            }
            prepared.push({ description: it.description, quantity, amount: Number(it.amount) });
        }
    }
    return prepared;
};

// POST /api/bills
exports.createBill = async (req, res) => {
    let items = [];
    let stockDeducted = false;
    try {
        const { patient, appointment, paidAmount = 0, paymentMethod } = req.body;

        if (!patient) throw fail(400, "Patient required hai");
        if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
            throw fail(400, "Kam se kam ek item chahiye");
        }
        if (!(await Patient.findById(patient))) throw fail(404, "Patient not found");

        items = await prepareItems(req.body.items);
        await deductStock(items);
        stockDeducted = true;

        const bill = await Bill.create({
            patient,
            appointment,
            items,
            paidAmount: Number(paidAmount) || 0,
            paymentMethod,
            createdBy: req.user?._id
        });

        res.status(201).json({ success: true, data: bill });
    } catch (error) {
        if (stockDeducted) await restoreStock(items);
        res.status(error.status || 400).json({ success: false, message: error.message });
    }
};

// GET /api/bills?status=pending&patient=<id>&page=1&limit=10
exports.getBills = async (req, res) => {
    try {
        const { status, patient, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (status) filter.paymentStatus = status;
        if (patient) filter.patient = patient;

        const skip = (Number(page) - 1) * Number(limit);

        const [bills, total] = await Promise.all([
            Bill.find(filter)
                .populate("patient")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Bill.countDocuments(filter)
        ]);

        res.json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: bills
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/bills/:id
exports.getBillById = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id).populate("patient").populate("appointment");
        if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });
        res.json({ success: true, data: bill });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// PATCH /api/bills/:id/pay   body: { amount: 500, paymentMethod: "upi" }
exports.addPayment = async (req, res) => {
    try {
        const amount = Number(req.body.amount);
        if (!(amount > 0)) throw fail(400, "Valid amount daalo");

        const bill = await Bill.findById(req.params.id);
        if (!bill) throw fail(404, "Bill not found");
        if (bill.paymentStatus === "cancelled") throw fail(400, "Cancelled bill pe payment nahi ho sakti");

        const due = bill.totalAmount - bill.paidAmount;
        if (amount > due) throw fail(400, `Sirf ₹${due} baaki hai`);

        bill.paidAmount += amount;
        if (req.body.paymentMethod) bill.paymentMethod = req.body.paymentMethod;
        await bill.save();

        res.json({ success: true, data: bill });
    } catch (error) {
        res.status(error.status || 400).json({ success: false, message: error.message });
    }
};

// PATCH /api/bills/:id/cancel
exports.cancelBill = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) throw fail(404, "Bill not found");
        if (bill.paymentStatus === "cancelled") throw fail(400, "Bill pehle se cancelled hai");
        if (bill.paidAmount > 0) throw fail(400, "Payment ho chuki hai, pehle refund handle karo");

        await restoreStock(bill.items);
        bill.paymentStatus = "cancelled";
        await bill.save();

        res.json({ success: true, data: bill });
    } catch (error) {
        res.status(error.status || 400).json({ success: false, message: error.message });
    }
};