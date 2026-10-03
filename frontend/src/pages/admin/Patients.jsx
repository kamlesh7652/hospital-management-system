import { useState, useEffect, useCallback, useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import {
    fetchPatients,
    createPatient,
    updatePatient,
    setPatientStatus,
} from "../../api/patientApi";
import PatientForm, { toForm } from "../../components/backend/patient/PatientForm";
import PatientTable from "../../components/backend/patient/PatientTable";
import DashboardLayout from '../../components/backend/layout/DashboardLayout';

const LIMIT = 10;

export default function Patients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(null); // patient object ya null
    const [msg, setMsg] = useState(null); // { type: 'success' | 'error', text }

    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");
    const [status, setStatus] = useState("");
    const [gender, setGender] = useState("");
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);

    // edit form ka initial value sirf tab badle jab editing badle
    const initialForm = useMemo(() => (editing ? toForm(editing) : null), [editing]);

    // search debounce
    useEffect(() => {
        const t = setTimeout(() => {
            setDebounced(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await fetchPatients({
                search: debounced || undefined,
                status: status || undefined,
                gender: gender || undefined,
                page,
                limit: LIMIT,
            });
            setPatients(data.data);
            setPages(data.pages);
            setTotal(data.total);
        } catch (err) {
            setMsg({ type: "error", text: err.response?.data?.message || "Failed to load patients" });
        } finally {
            setLoading(false);
        }
    }, [debounced, status, gender, page]);

    useEffect(() => {
        load();
    }, [load]);

    const errorText = (err) => {
        const list = err.response?.data?.errors;
        if (list?.length) return list.map((e) => e.message).join(", ");
        return err.response?.data?.message || "Something went wrong";
    };

    const handleSubmit = async (payload) => {
        setSaving(true);
        setMsg(null);
        try {
            if (editing) {
                await updatePatient(editing._id, payload);
                setMsg({ type: "success", text: "Patient updated successfully" });
                setEditing(null);
            } else {
                await createPatient(payload);
                setMsg({ type: "success", text: "Patient added successfully" });
            }
            load();
        } catch (err) {
            setMsg({ type: "error", text: errorText(err) });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (p) => {
        const active = p.user?.isActive !== false;
        const ok = window.confirm(
            `${active ? "Deactivate" : "Activate"} ${p.user?.name}?`
        );
        if (!ok) return;
        try {
            await setPatientStatus(p._id, !active);
            setMsg({ type: "success", text: active ? "Patient deactivated" : "Patient activated" });
            load();
        } catch (err) {
            setMsg({ type: "error", text: errorText(err) });
        }
    };

    return (
        <DashboardLayout>
 <div className="pat-page">
            <div className="page-head">
                <h1>Patients</h1>
                <p>Register and manage patient records.</p>
            </div>

            {msg && (
                <div className={`pat-alert ${msg.type}`} role="status">
                    {msg.text}
                    <button onClick={() => setMsg(null)} aria-label="Dismiss">×</button>
                </div>
            )}

            <PatientForm
                initial={initialForm}
                onSubmit={handleSubmit}
                onCancel={() => setEditing(null)}
                loading={saving}
            />

            <div className="doc-card" style={{ marginTop: 24 }}>
                <div className="pat-toolbar">
                    <div className="pat-search">
                        <FiSearch />
                        <input
                            placeholder="Search by name, email or phone"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select value={gender} onChange={(e) => { setGender(e.target.value); setPage(1); }}>
                        <option value="">All genders</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                        <option value="">All status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <PatientTable
                    patients={patients}
                    loading={loading}
                    onEdit={(p) => {
                        setEditing(p);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    onToggleStatus={handleToggleStatus}
                />

                <div className="pat-pager">
                    <span>{total} patient{total === 1 ? "" : "s"}</span>
                    <div>
                        <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                            Prev
                        </button>
                        <span className="pat-page-num">Page {page} of {pages}</span>
                        <button className="btn" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </DashboardLayout>
       
    );
}