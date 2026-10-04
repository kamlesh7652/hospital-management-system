import { useState } from "react";
import { FaSave, FaTimes } from "react-icons/fa";

const CATEGORIES = ["Tablet", "Capsule", "Syrup", "Injection", "Ointment", "Drops", "Other"];

const emptyForm = {
    name: "",
    category: "",
    manufacturer: "",
    price: "",
    stock: 0,
    expiryDate: "",
    batchNumber: ""
};

const toInputDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

const MedicineForm = ({ initialData, onSubmit, onCancel, loading }) => {
    const [form, setForm] = useState(
        initialData
            ? { ...emptyForm, ...initialData, expiryDate: toInputDate(initialData.expiryDate) }
            : emptyForm
    );
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const err = {};
        if (!form.name.trim()) err.name = "Name required hai";
        if (!form.batchNumber.trim()) err.batchNumber = "Batch number required hai";
        if (form.price === "" || Number(form.price) < 0) err.price = "Valid price daalo";
        if (form.stock === "" || Number(form.stock) < 0) err.stock = "Stock negative nahi ho sakta";
        if (form.expiryDate && new Date(form.expiryDate) < new Date(new Date().toDateString())) {
            err.expiryDate = "Expiry date past mein hai";
        }
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({
            ...form,
            name: form.name.trim(),
            batchNumber: form.batchNumber.trim(),
            price: Number(form.price),
            stock: Number(form.stock),
            expiryDate: form.expiryDate || undefined
        });
    };

    const FieldError = ({ name }) =>
        errors[name] ? <p className="med-error">{errors[name]}</p> : null;

    return (
        <form onSubmit={handleSubmit} className="med-form">
            <div className="med-field">
                <label>Medicine Name *</label>
                <input name="name" value={form.name} onChange={handleChange} className="med-input" />
                <FieldError name="name" />
            </div>

            <div className="med-field">
                <label>Batch Number *</label>
                <input name="batchNumber" value={form.batchNumber} onChange={handleChange} className="med-input" />
                <FieldError name="batchNumber" />
            </div>

            <div className="med-field">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="med-input">
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div className="med-field">
                <label>Manufacturer</label>
                <input name="manufacturer" value={form.manufacturer} onChange={handleChange} className="med-input" />
            </div>

            <div className="med-field">
                <label>Price (₹) *</label>
                <input type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleChange} className="med-input" />
                <FieldError name="price" />
            </div>

            <div className="med-field">
                <label>Stock</label>
                <input type="number" min="0" name="stock" value={form.stock} onChange={handleChange} className="med-input" />
                <FieldError name="stock" />
            </div>

            <div className="med-field">
                <label>Expiry Date</label>
                <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} className="med-input" />
                <FieldError name="expiryDate" />
            </div>

            <div className="med-form-actions">
                {onCancel && (
                    <button type="button" onClick={onCancel} title="Cancel" className="med-btn med-btn-outline">
                        <FaTimes /> Cancel
                    </button>
                )}
                <button type="submit" disabled={loading} title="Save medicine" className="med-btn med-btn-primary">
                    <FaSave /> {loading ? "Saving..." : "Save"}
                </button>
            </div>
        </form>
    );
};

export default MedicineForm;