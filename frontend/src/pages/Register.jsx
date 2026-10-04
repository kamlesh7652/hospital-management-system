import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';
import '../components/AuthCard.css';

const empty = {
  name: '', email: '', phone: '', password: '', confirmPassword: '',
  gender: '', dob: '',
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email';
    if (!/^\d{10}$/.test(form.phone)) er.phone = 'Enter a 10-digit phone number';
    if (!form.gender) er.gender = 'Select gender';
    if (!form.dob) er.dob = 'Date of birth is required';
    if (form.password.length < 6) er.password = 'At least 6 characters';
    if (form.confirmPassword !== form.password) er.confirmPassword = 'Passwords do not match';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
  e.preventDefault();
  setServerError('');
  if (!validate()) return;

  setLoading(true);
  try {
    const { confirmPassword, dob, ...rest } = form;
    await api.post('/auth/register', { ...rest, dateOfBirth: dob });

    navigate('/login');
  } catch (err) {
    setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <Topbar />
      <Navbar />
      <main className="auth-page">
        <div className="auth-card">
          <h1>Create your account</h1>
          <p className="lead">Register once to book appointments and access your records.</p>

          {serverError && <div className="auth-banner error">{serverError}</div>}

          <form className="auth-form" onSubmit={submit} noValidate>
            <div className={`field${errors.name ? ' invalid' : ''}`}>
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" value={form.name} onChange={change} placeholder="Your full name" />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className={`field${errors.email ? ' invalid' : ''}`}>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="auth-row">
              <div className={`field${errors.phone ? ' invalid' : ''}`}>
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" value={form.phone} onChange={change} placeholder="98765 43210" maxLength={10}/>
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
              <div className={`field${errors.gender ? ' invalid' : ''}`}>
                <label htmlFor="gender">Gender</label>
                <select id="gender" name="gender" value={form.gender} onChange={change}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="field-error">{errors.gender}</span>}
              </div>
            </div>

            <div className={`field${errors.dob ? ' invalid' : ''}`}>
              <label htmlFor="dob">Date of birth</label>
             <input
                id="dob"
                name="dob"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={form.dob}
                onChange={change}
              />
              {errors.dob && <span className="field-error">{errors.dob}</span>}
            </div>

            <div className="auth-row">
              <div className={`field${errors.password ? ' invalid' : ''}`}>
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" value={form.password} onChange={change} placeholder="At least 6 characters" />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
              <div className={`field${errors.confirmPassword ? ' invalid' : ''}`}>
                <label htmlFor="confirmPassword">Confirm password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={change} placeholder="Re-enter password" />
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            <button className="auth-submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
