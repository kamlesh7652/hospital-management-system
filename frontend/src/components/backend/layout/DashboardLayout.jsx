import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../../../context/AuthContext";
import './DashboardLayout.css';

const menus = {
  patient: [
    ['Dashboard', '/home', '🏠'],
    ['Book appointment', '/patient/book', '📅'],
    ['My appointments', '/patient/appointments', '🗓'],
    ['My records', '/patient/records', '📋'],
    ['My bills', '/patient/bills', '💳'],
  ],
  doctor: [
    ['Dashboard', '/home', '🏠'],
    ["Today's appointments", '/doctor/appointments', '🗓'],
    ['Patient records', '/doctor/records', '📋'],
  ],
  admin: [
    ['Dashboard', '/home', '🏠'],
    ['Doctors', '/admin/doctors', '🩺'],
    ['Patients', '/admin/patients', '🧑‍🤝‍🧑'],
    ['Medicines', '/admin/medicines', '💊'],
    ['Bills', '/admin/bills', '💳'],
  ],
  receptionist: [
    ['Dashboard', '/home', '🏠'],
    ['Appointments', '/reception/appointments', '🗓'],
    ['Patients', '/reception/patients', '🧑‍🤝‍🧑'],
  ],
  pharmacist: [
    ['Dashboard', '/home', '🏠'],
    ['Medicines', '/pharmacy/medicines', '💊'],
    ['Prescriptions', '/pharmacy/prescriptions', '📋'],
  ],
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const items = menus[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className={`dash${open ? ' sidebar-open' : ''}`}>
      <aside className="dash-sidebar">
        <Link to="/home" className="dash-logo">OHMS</Link>
        <nav className="dash-menu" aria-label="Dashboard menu">
          {items.map(([label, to, icon]) => (
            <Link
              key={to}
              to={to}
              className={`dash-link${location.pathname === to ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span aria-hidden="true">{icon}</span> {label}
            </Link>
          ))}
        </nav>
      </aside>

      {open && <div className="dash-overlay" onClick={() => setOpen(false)} />}

      <div className="dash-main">
        <header className="dash-header">
          <button
            className="dash-burger"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            ☰
          </button>
          <span className="dash-role">{user?.role}</span>
          <div className="dash-user">
            <span>{user?.name}</span>
            <button className="btn" onClick={handleLogout}>Log out</button>
          </div>
        </header>

        <main className="dash-content">{children}</main>

        <footer className="dash-footer">
          © {new Date().getFullYear()} OHMS – Online Hospital Management System
        </footer>
      </div>
    </div>
  );
}