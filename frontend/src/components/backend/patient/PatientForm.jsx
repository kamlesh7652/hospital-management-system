import { useState, useEffect } from "react";

const GENDERS = ["male", "female", "other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[A-Za-z][A-Za-z .'-]*$/;
const PHONE_RE = /^[6-9]\d{9}$/;

const empty = {
    name: "", email: "", password: "", phone: "",
    dateOfBirth: "", gender: "", bloodGroup: "",
    address: "", emergencyName: "", emergencyPhone: "",
};

// Backend ke patient object ko flat form state mein badalta hai
export const toForm = (p) => ({
    name: p.user?.name || "",
    email: p.user?.email || "",
    password: "",
    phone: p.user?.phone || "",
    dateOfBirth: p.dateOfBirth ? String(p.dateOfBirth).slice(0, 10) : "",
    gender: p.gender || "",
    bloodGroup: p.bloodGroup || "",
    address: p.address || "",
    emergencyName: p.emergencyContact?.name || "",
    emergencyPhone: p.emergencyContact?.phone || "",
});

const str = (v) => String(v ?? "").trim();
const today = () => new Date().toISOString().split("T")[0];

const validate = (f, isEdit) => {
    const e = {};

    if (!str(f.name)) e.name = "Full name is required";
    else if (str(f.name).length < 3) e.name = "Name must be at least 3 characters";
    else if (!NAME_RE.test(str(f.name))) e.name = "Name can only contain letters, spaces, . ' -";

    if (!isEdit) {
        if (!str(f.email)) e.email = "Email is required";
        else if (!EMAIL_RE.test(str(f.email))) e.email = "Enter a valid email address";

        if (!f.password) e.password = "Password is required";
        else if (f.password.length < 6) e.password = "Password must be at least 6 characters";
        else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password))
            e.password = "Use at least one letter and one number";
    }

    if (str(f.phone) && !PHONE_RE.test(str(f.phone)))
        e.phone = "Enter a valid 10-digit mobile number";

    if (!f.dateOfBirth) e.dateOfBirth = "Date of birth is required";
    else {
        const d = new Date(f.dateOfBirth);
        const now = new Date();
        if (Number.isNaN(d.getTime())) e.dateOfBirth = "Invalid date";
        else if (d > now) e.dateOfBirth = "Date of birth cannot be in the future";
        else if ((now - d) / (365.25 * 24 * 3600 * 1000) > 120)
            e.dateOfBirth = "Enter a realistic date of birth";
    }

    if (!f.gender) e.gender = "Select a gender";
    if (f.bloodGroup && !BLOOD_GROUPS.includes(f.bloodGroup))
        e.bloodGroup = "Select a valid blood group";
    if (str(f.address).length > 250) e.address = "Address cannot exceed 250 characters";

    const ecName = str(f.emergencyName);
    const ecPhone = str(f.emergencyPhone);
    if (ecName && !NAME_RE.test(ecName)) e.emergencyName = "Invalid name";
    if (ecPhone && !PHONE_RE.test(ecPhone)) e.emergencyPhone = "Enter a valid 10-digit number";
    else if (ecPhone && ecPhone === str(f.phone)) e.emergencyPhone = "Must differ from patient phone";
    if (ecName && !ecPhone) e.emergencyPhone = e.emergencyPhone || "Phone is required with a contact name";
    if (ecPhone && !ecName) e.emergencyName = e.emergencyName || "Name is required with a contact phone";

    return e;
};

export default function PatientForm({ initial, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState(initial || empty);
    const [touched, setTouched] = useState({});
    const isEdit = Boolean(initial);

    useEffect(() => {
        setForm(initial || empty);
        setTouched({});
    }, [initial]);

    const errors = validate(form, isEdit);
    const show = (name) => touched[name] && errors[name];

    const change = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };
    const blur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

    const submit = (e) => {
        e.preventDefault();
        setTouched(Object.keys(empty).reduce((a, k) => ({ ...a, [k]: true }), {}));
        if (Object.keys(errors).length) return;

        onSubmit({
            name: str(form.name),
            ...(isEdit ? {} : { email: str(form.email).toLowerCase(), password: form.password }),
            phone: str(form.phone),
            dateOfBirth: form.dateOfBirth,
            gender: form.gender,
            bloodGroup: form.bloodGroup || undefined,
            address: str(form.address),
            emergencyContact: { name: str(form.emergencyName), phone: str(form.emergencyPhone) },
        });
    };

    const fp = (name) => ({
        id: `pat-${name}`,
        name,
        value: form[name],
        onChange: change,
        onBlur: blur,
        "aria-invalid": Boolean(show(name)),
        className: show(name) ? "input-error" : undefined,
    });

    const Err = ({ name }) =>
        show(name) ? (
            <span className="field-error" role="alert">{errors[name]}</span>
        ) : null;

    return (
        <div className="doc-card">
            <div className="doc-card-head">
                <h2>{isEdit ? "Edit patient" : "Add a new patient"}</h2>
                <p>{isEdit ? "Update this patient\u2019s profile." : "Creates a login for the patient and their profile."}</p>
            </div>

            <form className="doc-form" onSubmit={submit} autoComplete="off" noValidate>
                <div className="doc-grid">
                    <div className="field">
                        <label htmlFor="pat-name">Full name</label>
                        <input {...fp("name")} autoComplete="off" />
                        <Err name="name" />
                    </div>

                    {!isEdit && (
                        <>
                            <div className="field">
                                <label htmlFor="pat-email">Email</label>
                                <input {...fp("email")} type="email" autoComplete="new-password" />
                                <Err name="email" />
                            </div>
                            <div className="field">
                                <label htmlFor="pat-password">Password</label>
                                <input {...fp("password")} type="password" autoComplete="new-password" />
                                <Err name="password" />
                            </div>
                        </>
                    )}

                    <div className="field">
                        <label htmlFor="pat-phone">Phone</label>
                        <input {...fp("phone")} inputMode="numeric" maxLength={10} autoComplete="off" />
                        <Err name="phone" />
                    </div>

                    <div className="field">
                        <label htmlFor="pat-dateOfBirth">Date of birth</label>
                        <input {...fp("dateOfBirth")} type="date" max={today()} />
                        <Err name="dateOfBirth" />
                    </div>

                    <div className="field">
                        <label htmlFor="pat-gender">Gender</label>
                        <select {...fp("gender")}>
                            <option value="">Select</option>
                            {GENDERS.map((g) => (
                                <option key={g} value={g}>{g[0].toUpperCase() + g.slice(1)}</option>
                            ))}
                        </select>
                        <Err name="gender" />
                    </div>

                    <div className="field">
                        <label htmlFor="pat-bloodGroup">Blood group</label>
                        <select {...fp("bloodGroup")}>
                            <option value="">Select</option>
                            {BLOOD_GROUPS.map((b) => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                        <Err name="bloodGroup" />
                    </div>

                    <div className="field">
                        <label htmlFor="pat-emergencyName">Emergency contact name</label>
                        <input {...fp("emergencyName")} autoComplete="off" />
                        <Err name="emergencyName" />
                    </div>

                    <div className="field">
                        <label htmlFor="pat-emergencyPhone">Emergency contact phone</label>
                        <input {...fp("emergencyPhone")} inputMode="numeric" maxLength={10} autoComplete="off" />
                        <Err name="emergencyPhone" />
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="pat-address">Address</label>
                    <textarea {...fp("address")} rows={3} maxLength={250} />
                    <Err name="address" />
                </div>

                <div className="form-actions">
                    {isEdit && (
                        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Saving\u2026" : isEdit ? "Save changes" : "Add patient"}
                    </button>
                </div>
            </form>
        </div>
    );
}