const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const billRoutes = require("./routes/billRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const { webhook } = require("./controllers/paymentController");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(morgan("dev"));

// webhook ko express.json() se PEHLE rakhna hai (raw body chahiye)
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), webhook);

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Hospital Management API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/payments", paymentRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Server error"
    });
});

module.exports = app;