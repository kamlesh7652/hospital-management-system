const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const billRoutes = require("./routes/billRoutes");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));

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