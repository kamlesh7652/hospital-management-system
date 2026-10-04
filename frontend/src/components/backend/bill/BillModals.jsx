import { useState } from "react";
import { money, patientName, STATUS_LABELS } from "./billUtils";

export const PaymentModal = ({ bill, onClose, onSave, loading }) => {
    const due = bill.totalAmount - bill.paidAmount;
    const [amount, setAmount] = useState(due);
    const [method, setMethod] = useState(bill.paymentMethod || "");
    const [error, setError] = useState("");

    const handleSave = () => {
        const a = Number(amount);
        if (!(a > 0)) return setError("Valid amount daalo");
        if (a > due) return setError(`Sirf ${money(due)} baaki hai`);
        if (!method) return setError("Payment method select karo");
        onSave({ amount: a, paymentMethod: method });
    };

    return (
        <div className="bill-overlay">
            <div className="bill-modal">
                <h3>Add Payment</h3>
                <p className="bill-modal-sub">
                    {bill.billNumber} · {patientName(bill.patient)}<br />
                    Total {money(bill.totalAmount)} · Paid {money(bill.paidAmount)} · Due <b>{money(due)}</b>
                </p>

                <div className="bill-field">
                    <label>Amount (₹)</label>
                    <input
                        type="number"
                        min="0"
                        value={amount}
                        onChange={(e) => { setAmount(e.target.value); setError(""); }}
                        className="bill-input"
                    />
                </div>

                <div className="bill-field" style={{ marginTop: 12 }}>
                    <label>Payment method</label>
                    <select
                        value={method}
                        onChange={(e) => { setMethod(e.target.value); setError(""); }}
                        className="bill-input"
                    >
                        <option value="">Select</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                    </select>
                </div>

                {error && <p className="bill-error">{error}</p>}

                <div className="bill-modal-actions">
                    <button onClick={onClose} className="bill-btn bill-btn-outline">Cancel</button>
                    <button onClick={handleSave} disabled={loading} className="bill-btn bill-btn-primary">
                        {loading ? "Saving..." : "Save payment"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const BillDetailModal = ({ bill, onClose }) => (
    <div className="bill-overlay">
        <div className="bill-modal bill-modal-wide">
            <h3>{bill.billNumber}</h3>
            <p className="bill-modal-sub">
                {patientName(bill.patient)} · {new Date(bill.createdAt).toLocaleDateString("en-IN")} ·{" "}
                {STATUS_LABELS[bill.paymentStatus]}
                {bill.paymentMethod ? ` · ${bill.paymentMethod.toUpperCase()}` : ""}
            </p>

            <table className="bill-table bill-detail-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th className="bill-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {bill.items.map((it, i) => (
                        <tr key={i}>
                            <td>{it.description}</td>
                            <td>{it.quantity}</td>
                            <td>{money(it.amount)}</td>
                            <td className="bill-right">{money(it.quantity * it.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="bill-totals bill-totals-detail">
                <div><span>Total</span><b>{money(bill.totalAmount)}</b></div>
                <div><span>Paid</span><b>{money(bill.paidAmount)}</b></div>
                <div><span>Due</span><b>{bill.paymentStatus === "cancelled" ? "-" : money(bill.totalAmount - bill.paidAmount)}</b></div>
            </div>

            <div className="bill-modal-actions">
                <button onClick={onClose} className="bill-btn bill-btn-outline">Close</button>
            </div>
        </div>
    </div>
);