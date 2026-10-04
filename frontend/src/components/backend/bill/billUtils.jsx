export const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export const patientName = (p) =>
    p?.name || p?.fullName || p?.user?.name || "Unknown patient";

export const STATUS_LABELS = {
    pending: "Pending",
    partially_paid: "Partially paid",
    paid: "Paid",
    cancelled: "Cancelled"
};