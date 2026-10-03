import { useState, useEffect } from 'react';

const empty = {
  name: '', email: '', password: '', phone: '',
  specialization: '', qualification: '', experience: '',
  consultationFee: '', availableDays: [],
};

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[A-Za-z][A-Za-z .'-]*$/;
const PHONE_RE = /^[6-9]\d{9}$/; // Indian 10-digit mobile

const validate = (f, isEdit) => {
  const e = {};
  const str = (v) => String(v ?? '').trim();

  // Name
  if (!str(f.name)) e.name = 'Full name is required';
  else if (str(f.name).length < 3) e.name = 'Name must be at least 3 characters';
  else if (!NAME_RE.test(str(f.name))) e.name = 'Name can only contain letters, spaces, . \' -';

  // Email + password (create only)
  if (!isEdit) {
    if (!str(f.email)) e.email = 'Email is required';
    else if (!EMAIL_RE.test(str(f.email))) e.email = 'Enter a valid email address';

    if (!f.password) e.password = 'Password is required';
    else if (f.password.length < 6) e.password = 'Password must be at least 6 characters';
    else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password))
      e.password = 'Use at least one letter and one number';
  }

  // Phone (optional, but must be valid if given)
  if (str(f.phone) && !PHONE_RE.test(str(f.phone)))
    e.phone = 'Enter a valid 10-digit mobile number';

  // Specialization
  if (!str(f.specialization)) e.specialization = 'Specialization is required';
  else if (str(f.specialization).length < 2) e.specialization = 'Too short';

  // Experience (optional)
  if (str(f.experience) !== '') {
    const n = Number(f.experience);
    if (!Number.isInteger(n) || n < 0) e.experience = 'Enter a whole number (0 or more)';
    else if (n > 60) e.experience = 'Experience cannot exceed 60 years';
  }

  // Fee
  if (str(f.consultationFee) === '') e.consultationFee = 'Consultation fee is required';
  else {
    const n = Number(f.consultationFee);
    if (Number.isNaN(n) || n <= 0) e.consultationFee = 'Fee must be greater than 0';
    else if (n > 100000) e.consultationFee = 'Fee seems too high';
  }

  // Days
  if (!f.availableDays.length) e.availableDays = 'Select at least one available day';

  return e;
};

export default function DoctorForm({ initial, onSubmit, onCancel, loading }) {
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

  const blur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
  };

  const toggleDay = (d) => {
    setTouched((t) => ({ ...t, availableDays: true }));
    setForm((f) => ({
      ...f,
      availableDays: f.availableDays.includes(d)
        ? f.availableDays.filter((x) => x !== d)
        : [...f.availableDays, d],
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    // mark everything touched so all errors show
    setTouched(Object.keys(empty).reduce((a, k) => ({ ...a, [k]: true }), {}));
    if (Object.keys(errors).length) return;

    onSubmit({
      ...form,
      name: String(form.name).trim(),
      email: String(form.email).trim().toLowerCase(),
      phone: String(form.phone).trim(),
      specialization: String(form.specialization).trim(),
      qualification: String(form.qualification).trim(),
      experience: form.experience === '' ? undefined : Number(form.experience),
      consultationFee: Number(form.consultationFee),
    });
  };

  const fieldProps = (name) => ({
    id: `doc-${name}`,
    name,
    value: form[name],
    onChange: change,
    onBlur: blur,
    'aria-invalid': Boolean(show(name)),
    'aria-describedby': show(name) ? `doc-${name}-err` : undefined,
    className: show(name) ? 'input-error' : undefined,
  });

  const Err = ({ name }) =>
    show(name) ? (
      <span id={`doc-${name}-err`} className="field-error" role="alert">
        {errors[name]}
      </span>
    ) : null;

  return (
    <div className="doc-card">
      <div className="doc-card-head">
        <h2>{isEdit ? 'Edit doctor' : 'Add a new doctor'}</h2>
        <p>{isEdit ? 'Update this doctor\u2019s profile.' : 'Creates a login for the doctor and their profile.'}</p>
      </div>

      <form className="doc-form" onSubmit={submit} autoComplete="off" noValidate>
        <div className="doc-grid">
          <div className="field">
            <label htmlFor="doc-name">Full name</label>
            <input {...fieldProps('name')} autoComplete="off" />
            <Err name="name" />
          </div>

          {!isEdit && (
            <>
              <div className="field">
                <label htmlFor="doc-email">Email</label>
                <input {...fieldProps('email')} type="email" autoComplete="new-password" />
                <Err name="email" />
              </div>
              <div className="field">
                <label htmlFor="doc-password">Password</label>
                <input {...fieldProps('password')} type="password" autoComplete="new-password" />
                <Err name="password" />
              </div>
            </>
          )}

          <div className="field">
            <label htmlFor="doc-phone">Phone</label>
            <input {...fieldProps('phone')} inputMode="numeric" maxLength={10} autoComplete="off" />
            <Err name="phone" />
          </div>

          <div className="field">
            <label htmlFor="doc-specialization">Specialization</label>
            <input {...fieldProps('specialization')} autoComplete="off" />
            <Err name="specialization" />
          </div>

          <div className="field">
            <label htmlFor="doc-qualification">Qualification</label>
            <input {...fieldProps('qualification')} autoComplete="off" />
          </div>

          <div className="field">
            <label htmlFor="doc-experience">Experience (years)</label>
            <input {...fieldProps('experience')} type="number" min="0" max="60" autoComplete="off" />
            <Err name="experience" />
          </div>

          <div className="field">
            <label htmlFor="doc-consultationFee">Consultation fee (₹)</label>
            <input {...fieldProps('consultationFee')} type="number" min="0" autoComplete="off" />
            <Err name="consultationFee" />
          </div>
        </div>

        <div className="field">
          <label>Available days</label>
          <div className="day-picker">
            {days.map((d) => (
              <button
                type="button"
                key={d}
                className={`day-chip${form.availableDays.includes(d) ? ' active' : ''}`}
                onClick={() => toggleDay(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <Err name="availableDays" />
        </div>

        <div className="form-actions">
          {isEdit && (
            <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving\u2026' : isEdit ? 'Save changes' : 'Add doctor'}
          </button>
        </div>
      </form>
    </div>
  );
}