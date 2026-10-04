const Medicine = require("../models/Medicine");

// POST /api/medicines
exports.createMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.create(req.body);
        res.status(201).json({ success: true, data: medicine });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Is name aur batch number ki medicine pehle se exist karti hai"
            });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// GET /api/medicines?search=para&category=Tablet&lowStock=true&expired=true&page=1&limit=10
exports.getMedicines = async (req, res) => {
    try {
        const { search, category, lowStock, expired, page = 1, limit = 10 } = req.query;
        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { manufacturer: { $regex: search, $options: "i" } },
                { batchNumber: { $regex: search, $options: "i" } }
            ];
        }
        if (category) filter.category = category;
        if (lowStock === "true") filter.stock = { $lte: 10 };
        if (expired === "true") filter.expiryDate = { $lt: new Date() };

        const skip = (Number(page) - 1) * Number(limit);

        const [medicines, total] = await Promise.all([
            Medicine.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            Medicine.countDocuments(filter)
        ]);

        res.json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: medicines
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/medicines/:id
exports.getMedicineById = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ success: false, message: "Medicine not found" });
        }
        res.json({ success: true, data: medicine });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// PUT /api/medicines/:id
exports.updateMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!medicine) {
            return res.status(404).json({ success: false, message: "Medicine not found" });
        }
        res.json({ success: true, data: medicine });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Is name aur batch number ki medicine pehle se exist karti hai"
            });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// PATCH /api/medicines/:id/stock   body: { quantity: 20 }  (negative = stock kam)
exports.updateStock = async (req, res) => {
    try {
        const quantity = Number(req.body.quantity);
        if (Number.isNaN(quantity)) {
            return res.status(400).json({ success: false, message: "Valid quantity required" });
        }

        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ success: false, message: "Medicine not found" });
        }
        if (medicine.stock + quantity < 0) {
            return res.status(400).json({ success: false, message: "Stock negative nahi ho sakta" });
        }

        medicine.stock += quantity;
        await medicine.save();
        res.json({ success: true, data: medicine });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE /api/medicines/:id
exports.deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndDelete(req.params.id);
        if (!medicine) {
            return res.status(404).json({ success: false, message: "Medicine not found" });
        }
        res.json({ success: true, message: "Medicine deleted" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};