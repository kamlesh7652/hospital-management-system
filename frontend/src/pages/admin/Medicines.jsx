import { useCallback, useEffect, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import {
    fetchMedicines,
    createMedicine,
    updateMedicine,
    updateMedicineStock,
    deleteMedicine
} from "../../api/medicines";
import MedicineForm from "../../components/backend/medicine/MedicineForm";
import MedicineList from "../../components/backend/medicine/MedicineList";
import StockModal from "../../components/backend/medicine/StockModal";
import DashboardLayout from '../../components/backend/layout/DashboardLayout';
import "../../components/backend/medicine/medicine.css";
const FILTERS = [
    { key: "all", label: "All" },
    { key: "lowStock", label: "Low stock" },
    { key: "expired", label: "Expired" }
];

const Medicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null); // { type, text }

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formKey, setFormKey] = useState(0);
    const [stockTarget, setStockTarget] = useState(null);

    // search debounce
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (debouncedSearch) params.search = debouncedSearch;
            if (filter === "lowStock") params.lowStock = true;
            if (filter === "expired") params.expired = true;

            const res = await fetchMedicines(params);
            setMedicines(res.data.data);
            setPages(res.data.pages || 1);
        } catch (err) {
            showMessage("error", err.response?.data?.message || "Medicines load nahi hui");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, filter]);

    useEffect(() => {
        load();
    }, [load]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3500);
    };

    const openAdd = () => {
        setEditing(null);
        setFormKey((k) => k + 1);
        setShowForm(true);
    };

    const openEdit = (m) => {
        setEditing(m);
        setFormKey((k) => k + 1);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
    };

    const handleSubmit = async (data) => {
        try {
            setSaving(true);
            if (editing) {
                await updateMedicine(editing._id, data);
                showMessage("success", "Medicine update ho gayi");
                closeForm();
            } else {
                await createMedicine(data);
                showMessage("success", "Medicine add ho gayi");
                setFormKey((k) => k + 1); // form reset
            }
            load();
        } catch (err) {
            showMessage("error", err.response?.data?.message || "Save nahi hui");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (m) => {
        if (!window.confirm(`${m.name} (Batch ${m.batchNumber}) delete karni hai?`)) return;
        try {
            await deleteMedicine(m._id);
            showMessage("success", "Medicine delete ho gayi");
            load();
        } catch (err) {
            showMessage("error", err.response?.data?.message || "Delete nahi hui");
        }
    };

    const handleStock = async (quantity) => {
        try {
            setSaving(true);
            await updateMedicineStock(stockTarget._id, quantity);
            showMessage("success", "Stock update ho gaya");
            setStockTarget(null);
            load();
        } catch (err) {
            showMessage("error", err.response?.data?.message || "Stock update nahi hua");
        } finally {
            setSaving(false);
        }
    };

        return (
        <DashboardLayout>
            <div className="med-page">
                <div className="med-header">
                    <h1 className="med-title">Medicines</h1>
                    <button onClick={openAdd} title="Add new medicine" className="med-btn med-btn-primary">
                        <FaPlus /> Add Medicine
                    </button>
                </div>

                {message && (
                    <div className={`med-alert ${message.type === "success" ? "med-alert-success" : "med-alert-error"}`}>
                        {message.text}
                    </div>
                )}

                {showForm && (
                    <div className="med-card">
                        <div className="med-card-body">
                            <h2 className="med-card-title">{editing ? "Edit Medicine" : "Add Medicine"}</h2>
                            <MedicineForm
                                key={formKey}
                                initialData={editing}
                                onSubmit={handleSubmit}
                                onCancel={closeForm}
                                loading={saving}
                            />
                        </div>
                    </div>
                )}

                <div className="med-card">
                    <div className="med-toolbar">
                        <div className="med-search">
                            <FaSearch />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Name, manufacturer ya batch..."
                                className="med-input"
                            />
                        </div>
                        <div className="med-filters">
                            {FILTERS.map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => { setFilter(f.key); setPage(1); }}
                                    className={`med-chip ${filter === f.key ? "active" : ""}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <p className="med-empty">Loading...</p>
                    ) : (
                        <MedicineList
                            medicines={medicines}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                            onStock={setStockTarget}
                        />
                    )}

                    {pages > 1 && (
                        <div className="med-pagination">
                            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="med-btn med-btn-outline">
                                Previous
                            </button>
                            <span>Page {page} of {pages}</span>
                            <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="med-btn med-btn-outline">
                                Next
                            </button>
                        </div>
                    )}
                </div>

                {stockTarget && (
                    <StockModal
                        medicine={stockTarget}
                        onClose={() => setStockTarget(null)}
                        onSave={handleStock}
                        loading={saving}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default Medicines;