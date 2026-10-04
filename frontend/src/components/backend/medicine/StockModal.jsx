import { useState } from "react";

const StockModal = ({ medicine, onClose, onSave, loading }) => {
    const [quantity, setQuantity] = useState("");
    const [error, setError] = useState("");

    const handleSave = () => {
        const q = Number(quantity);
        if (!quantity || Number.isNaN(q) || q === 0) return setError("Non-zero quantity daalo");
        if (medicine.stock + q < 0) return setError("Stock negative ho jayega");
        onSave(q);
    };

    return (
        <div className="med-overlay">
            <div className="med-modal">
                <h3>Update Stock</h3>
                <p className="med-modal-sub">
                    {medicine.name} (Batch {medicine.batchNumber}) · Current: <b>{medicine.stock}</b>
                </p>
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => { setQuantity(e.target.value); setError(""); }}
                    placeholder="+20 add ke liye, -5 kam ke liye"
                    className="med-input"
                />
                {error && <p className="med-error">{error}</p>}
                <div className="med-modal-actions">
                    <button onClick={onClose} className="med-btn med-btn-outline">Cancel</button>
                    <button onClick={handleSave} disabled={loading} className="med-btn med-btn-primary">
                        {loading ? "Updating..." : "Update"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockModal;