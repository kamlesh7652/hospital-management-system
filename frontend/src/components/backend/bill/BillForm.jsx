import { useState } from "react";
import { FaPlus, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { money, patientName } from "./billUtils";

const newItem = () => ({ type: "medicine", medicine: "", description: "", quantity: 1, amount: "" });

const isExpired = (m) => m.expiryDate && new Date(m.expiryDate) < new Date();

const BillForm = ({ patients, medicines, onSubmit, onCancel, loading }) => {
    const [patient, setPatient] = useState("");
    const [items, setItems] = useState([newItem()]);
    const [paidAmount, setPaidAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [errors, setErrors] = useState({});

    const medicineById = (id) => medicines.find((m) => m._id === id);

    const unitPrice = (it) =>
        it.type === "medicine" ? medicineById(it.medicine)?.price || 0 : Number(it.amount) || 0;

    const total = items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * unitPrice(it), 0);

    const updateItem = (index, changes) => {
        setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...changes } : it)));
        setErrors({});
    };

    const addItem = () => setItems((prev) => [...prev, newItem()]);
    const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

    const validate = () => {
        const err = {};
        if (!patient) err.patient = "Patient select karo";

        items.forEach((it, i) => {
            const qty = Number(it.quantity);
            if (!Number.isInteger(qty) || qty < 1) {
                err[`item${i}`] = "Quantity kam se kam 1 honi chahiye";
            } else if (it.type === "medicine") {
                const med = medicineById(it.medicine);
                if (!med) err[`item${i}`] = "Medicine select karo";
                else if (qty > med.stock) err[`item${i}`] = `Sirf ${med.stock} stock hai`;
            } else if (!it.description.trim() || it.amount === "" || Number(it.amount) < 0) {
                err[`item${i}`] = "Description aur valid amount daalo";
            }
        });

        const paid = Number(paidAmount) || 0;
        if (paid < 0) err.paid = "Paid amount negative nahi ho sakta";
        else if (paid > total) err.paid = "Paid amount total se zyada hai";
        else if (paid > 0 && !paymentMethod) err.method = "Payment method select karo";

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        onSubmit({
            patient,
            items: items.map((it) =>
                it.type === "medicine"
                    ? { medicine: it.medicine, quantity: Number(it.quantity) }
                    : { description: it.description.trim(), quantity: Number(it.quantity), amount: Number(it.amount) }
            ),
            paidAmount: Number(paidAmount) || 0,
            paymentMethod: paymentMethod || undefined
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bill-form">
            <div className="bill-field">
                <label>Patient *</label>
                <select
                    value={patient}
                    onChange={(e) => { setPatient(e.target.value); setErrors({}); }}
                    className="bill-input"
                >
                    <option value="">Select patient</option>
                    {patients.map((p) => (
                        <option key={p._id} value={p._id}>
                            {patientName(p)}{p.phone ? ` · ${p.phone}` : ""}
                        </option>
                    ))}
                </select>
                {errors.patient && <p className="bill-error">{errors.patient}</p>}
            </div>

            <div className="bill-items">
                <div className="bill-items-head">
                    <h3>Items</h3>
                    <button type="button" onClick={addItem} className="bill-btn bill-btn-outline" title="Add item">
                        <FaPlus /> Add item
                    </button>
                </div>

                {items.map((it, i) => (
                    <div key={i} className="bill-item">
                        <div className="bill-item-row">
                            <select
                                value={it.type}
                                onChange={(e) => updateItem(i, { type: e.target.value, medicine: "", description: "", amount: "" })}
                                className="bill-input bill-type"
                            >
                                <option value="medicine">Medicine</option>
                                <option value="custom">Other (fee/test)</option>
                            </select>

                            {it.type === "medicine" ? (
                                <select
                                    value={it.medicine}
                                    onChange={(e) => updateItem(i, { medicine: e.target.value })}
                                    className="bill-input bill-grow"
                                >
                                    <option value="">Select medicine</option>
                                    {medicines.map((m) => (
                                        <option key={m._id} value={m._id} disabled={m.stock === 0 || isExpired(m)}>
                                            {m.name} (Batch {m.batchNumber}) · {money(m.price)} · stock {m.stock}
                                            {isExpired(m) ? " · EXPIRED" : ""}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <>
                                    <input
                                        placeholder="Description (e.g. Consultation fee)"
                                        value={it.description}
                                        onChange={(e) => updateItem(i, { description: e.target.value })}
                                        className="bill-input bill-grow"
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Amount"
                                        value={it.amount}
                                        onChange={(e) => updateItem(i, { amount: e.target.value })}
                                        className="bill-input bill-amount"
                                    />
                                </>
                            )}

                            <input
                                type="number"
                                min="1"
                                value={it.quantity}
                                onChange={(e) => updateItem(i, { quantity: e.target.value })}
                                className="bill-input bill-qty"
                                title="Quantity"
                            />

                            <span className="bill-line-total">
                                {money((Number(it.quantity) || 0) * unitPrice(it))}
                            </span>

                            <button
                                type="button"
                                onClick={() => removeItem(i)}
                                disabled={items.length === 1}
                                title="Remove item"
                                className="bill-icon-btn delete"
                            >
                                <FaTrash />
                            </button>
                        </div>
                        {errors[`item${i}`] && <p className="bill-error">{errors[`item${i}`]}</p>}
                    </div>
                ))}
            </div>

            <div className="bill-summary">
                <div className="bill-field">
                    <label>Paid now (₹)</label>
                    <input
                        type="number"
                        min="0"
                        value={paidAmount}
                        onChange={(e) => { setPaidAmount(e.target.value); setErrors({}); }}
                        className="bill-input"
                    />
                    {errors.paid && <p className="bill-error">{errors.paid}</p>}
                </div>

                <div className="bill-field">
                    <label>Payment method</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => { setPaymentMethod(e.target.value); setErrors({}); }}
                        className="bill-input"
                    >
                        <option value="">Select</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                    </select>
                    {errors.method && <p className="bill-error">{errors.method}</p>}
                </div>

                <div className="bill-totals">
                    <div><span>Total</span><b>{money(total)}</b></div>
                    <div><span>Due</span><b>{money(Math.max(total - (Number(paidAmount) || 0), 0))}</b></div>
                </div>
            </div>

            <div className="bill-form-actions">
                <button type="button" onClick={onCancel} className="bill-btn bill-btn-outline" title="Cancel">
                    <FaTimes /> Cancel
                </button>
                <button type="submit" disabled={loading} className="bill-btn bill-btn-primary" title="Generate bill">
                    <FaSave /> {loading ? "Saving..." : "Generate Bill"}
                </button>
            </div>
        </form>
    );
};

export default BillForm;