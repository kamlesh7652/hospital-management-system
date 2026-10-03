import { FiEdit2, FiUserX, FiUserCheck } from "react-icons/fi";

const age = (dob) => {
    if (!dob) return "—";
    const years = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000));
    return Number.isNaN(years) ? "—" : years;
};

export default function PatientTable({ patients, loading, onEdit, onToggleStatus }) {
    if (loading) return <div className="pat-empty">Loading patients…</div>;
    if (!patients.length) return <div className="pat-empty">No patients found.</div>;

    return (
        <div className="pat-table-wrap">
            <table className="pat-table">
                <thead>
                    <tr>
                        <th>Patient</th>
                        <th>Phone</th>
                        <th>Age / Gender</th>
                        <th>Blood</th>
                        <th>Status</th>
                        <th className="pat-actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map((p) => {
                        const active = p.user?.isActive !== false;
                        return (
                            <tr key={p._id} className={active ? "" : "pat-row-inactive"}>
                                <td>
                                    <div className="pat-name">{p.user?.name}</div>
                                    <div className="pat-sub">{p.user?.email}</div>
                                </td>
                                <td>{p.user?.phone || "—"}</td>
                                <td style={{ textTransform: "capitalize" }}>
                                    {age(p.dateOfBirth)} / {p.gender || "—"}
                                </td>
                                <td>{p.bloodGroup || "—"}</td>
                                <td>
                                    <span className={`pat-badge ${active ? "on" : "off"}`}>
                                        {active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="pat-actions-col">
                                    <button
                                        className="icon-btn"
                                        title="Edit patient"
                                        aria-label="Edit patient"
                                        onClick={() => onEdit(p)}
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        className={`icon-btn ${active ? "danger" : "success"}`}
                                        title={active ? "Deactivate patient" : "Activate patient"}
                                        aria-label={active ? "Deactivate patient" : "Activate patient"}
                                        onClick={() => onToggleStatus(p)}
                                    >
                                        {active ? <FiUserX /> : <FiUserCheck />}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}