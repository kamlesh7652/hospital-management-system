import { FaEdit, FaTrash, FaBoxes } from "react-icons/fa";

const LOW_STOCK = 10;

const StatusBadges = ({ medicine }) => {
    const badges = [];
    const now = new Date();

    if (medicine.expiryDate) {
        const days = Math.ceil((new Date(medicine.expiryDate) - now) / (1000 * 60 * 60 * 24));
        if (days < 0) badges.push({ text: "Expired", cls: "med-badge-danger" });
        else if (days <= 30) badges.push({ text: "Expiring soon", cls: "med-badge-warn" });
    }
    if (medicine.stock === 0) badges.push({ text: "Out of stock", cls: "med-badge-danger" });
    else if (medicine.stock <= LOW_STOCK) badges.push({ text: "Low stock", cls: "med-badge-warn" });

    if (badges.length === 0) badges.push({ text: "OK", cls: "med-badge-ok" });

    return (
        <div className="med-badges">
            {badges.map((b) => (
                <span key={b.text} className={`med-badge ${b.cls}`}>{b.text}</span>
            ))}
        </div>
    );
};

const MedicineList = ({ medicines, onEdit, onDelete, onStock }) => {
    if (medicines.length === 0) {
        return <p className="med-empty">Koi medicine nahi mili.</p>;
    }

    return (
        <div className="med-table-wrap">
            <table className="med-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Batch</th>
                        <th>Category</th>
                        <th>Manufacturer</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Expiry</th>
                        <th>Status</th>
                        <th className="med-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {medicines.map((m) => (
                        <tr key={m._id}>
                            <td className="med-name">{m.name}</td>
                            <td>{m.batchNumber}</td>
                            <td>{m.category || "-"}</td>
                            <td>{m.manufacturer || "-"}</td>
                            <td>₹{m.price}</td>
                            <td>{m.stock}</td>
                            <td>{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString("en-IN") : "-"}</td>
                            <td><StatusBadges medicine={m} /></td>
                            <td>
                                <div className="med-actions">
                                    <button title="Update stock" onClick={() => onStock(m)} className="med-icon-btn stock">
                                        <FaBoxes />
                                    </button>
                                    <button title="Edit" onClick={() => onEdit(m)} className="med-icon-btn edit">
                                        <FaEdit />
                                    </button>
                                    <button title="Delete" onClick={() => onDelete(m)} className="med-icon-btn delete">
                                        <FaTrash />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MedicineList;