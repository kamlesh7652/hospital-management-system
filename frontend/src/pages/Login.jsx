import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import '../components/AuthCard.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email';
    if (!form.password) er.password = 'Password is required';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/home');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Invalid email or password.');
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
          <h1>User Login</h1>
          <p className="lead">Log in to manage your appointments and records.</p>

          {serverError && <div className="auth-banner error">{serverError}</div>}

          <form className="auth-form" onSubmit={submit} noValidate>
            <div className={`field${errors.email ? ' invalid' : ''}`}>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" autoFocus />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className={`field${errors.password ? ' invalid' : ''}`}>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={change} placeholder="Your password" />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <button className="auth-submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}