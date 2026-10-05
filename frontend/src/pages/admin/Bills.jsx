import { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import DashboardLayout from "../../components/backend/layout/DashboardLayout";
import BillForm from "../../components/backend/bill/BillForm";
import BillList from "../../components/backend/bill/BillList";
import { PaymentModal, BillDetailModal } from "../../components/backend/bill/BillModals";
import { fetchBills, createBill, addBillPayment, cancelBill } from "../../api/bills";
import { payOnline } from "../../api/payments";
import { fetchPatients } from "../../api/patientApi";
import { fetchMedicines } from "../../api/medicines";
import "../../components/backend/bill/bill.css";

const FILTERS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "partially_paid", label: "Partially paid" },
    { key: "paid", label: "Paid" },
    { key: "cancelled", label: "Cancelled" }
];

const Bills = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const [patients, setPatients] = useState([]);
    const [medicines, setMedicines] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [formKey, setFormKey] = useState(0);
    const [viewTarget, setViewTarget] = useState(null);
    const [payTarget, setPayTarget] = useState(null);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3500);
    };

    const loadLookups = useCallback(async () => {
        try {
            const [p, m] = await Promise.all([
                fetchPatients({ page: 1, limit: 200 }),
                fetchMedicines({ page: 1, limit: 200 })
            ]);
            setPatients(p.data.data || []);
            setMedicines(m.data.data || []);
        } catch (err) {
            showMessage("error", err.response?.data?.message || "Patients/medicines load nahi hue");
        }
    }, []);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (filter !== "all") params.status = filter;
            const res = await fetchBills(params);
            setBills(res.data.data);
            setPages(res.data.pages || 1);
        } catch (err) {
            showMessage("error", err.response?.data?.message || "Bills load nahi hue");
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => { loadLookups(); }, [loadLookups]);
    useEffect(() => { load(); }, [load]);

    const openForm = () => {
        setFormKey((k) => k + 1);
        setShowForm(true);
        loadLookups(); // fresh stock dikhane ke liye
    };

    const handleCreate = async (data) => {
        try {
            setSaving(true);
            await createBill(data);
            showMessage("success", "Bill ban gaya");
            setShowForm(false);
            if (page !== 1) setPage(1);
            load();
            loadLookups();
        } catch (err) {
            showMessage("error", err.response?.data?.message || "Bill nahi bana");
        } finally {
            setSaving(false);
        }
    };

    const handlePay = async (data) => {
        try {
            setSaving(true);
            await addBillPayment(payTarget._id, data);
            showMessage("success", "Payment save ho gayi");
            setPayTarget(null);
            load();
        } catch (err) {
            showMessage("error", err.response?.data?.message || "Payment save nahi hui");
        } finally {
            setSaving(false);
        }
    };

    const handlePayOnline = (bill) =>
        payOnline(bill, {
            onSuccess: () => {
                showMessage("success", "Online payment ho gayi");
                load();
            },
            onError: (msg) => showMessage("error", msg)
        });

    const handleCancel = async (bill) => {
        if (!window.confirm(`${bill.billNumber} cancel karna hai? Medicine ka stock wapas ho jayega.`)) return;
        try {
            await cancelBill(bill._id);
            showMessage("success", "Bill cancel ho gaya");
            load();
            loadLookups();
        } catch (err) {
            showMessage("error", err.response?.data?.message || "Cancel nahi hua");
        }
    };

    return (
        <DashboardLayout>
            <div className="bill-page">
                <div className="bill-header">
                    <h1 className="bill-title">Bills</h1>
                    <button onClick={openForm} title="Create new bill" className="bill-btn bill-btn-primary">
                        <FaPlus /> New Bill
                    </button>
                </div>

                {message && (
                    <div className={`bill-alert ${message.type === "success" ? "bill-alert-success" : "bill-alert-error"}`}>
                        {message.text}
                    </div>
                )}

                {showForm && (
                    <div className="bill-card">
                        <div className="bill-card-body">
                            <h2 className="bill-card-title">Create Bill</h2>
                            <BillForm
                                key={formKey}
                                patients={patients}
                                medicines={medicines}
                                onSubmit={handleCreate}
                                onCancel={() => setShowForm(false)}
                                loading={saving}
                            />
                        </div>
                    </div>
                )}

                <div className="bill-card">
                    <div className="bill-toolbar">
                        <div className="bill-filters">
                            {FILTERS.map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => { setFilter(f.key); setPage(1); }}
                                    className={`bill-chip ${filter === f.key ? "active" : ""}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <p className="bill-empty">Loading...</p>
                    ) : (
                        <BillList
                            bills={bills}
                            onView={setViewTarget}
                            onPay={setPayTarget}
                            onPayOnline={handlePayOnline}
                            onCancel={handleCancel}
                        />
                    )}

                    {pages > 1 && (
                        <div className="bill-pagination">
                            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="bill-btn bill-btn-outline">
                                Previous
                            </button>
                            <span>Page {page} of {pages}</span>
                            <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="bill-btn bill-btn-outline">
                                Next
                            </button>
                        </div>
                    )}
                </div>

                {viewTarget && <BillDetailModal bill={viewTarget} onClose={() => setViewTarget(null)} />}
                {payTarget && (
                    <PaymentModal
                        bill={payTarget}
                        onClose={() => setPayTarget(null)}
                        onSave={handlePay}
                        loading={saving}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default Bills;