import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const actions = {
  patient: [
    ['Book appointment', 'Choose a doctor and a time slot', '/patient/book'],
    ['My appointments', 'See upcoming visits or cancel one', '/patient/appointments'],
    ['My records', 'Diagnosis and prescriptions', '/patient/records'],
    ['My bills', 'Check and pay pending bills', '/patient/bills'],
  ],
  doctor: [
    ["Today's appointments", 'Approve, reject or complete visits', '/doctor/appointments'],
    ['Patient records', 'Add diagnosis and prescription', '/doctor/records'],
  ],
  admin: [
    ['Doctors', 'Add, edit or remove doctors', '/admin/doctors'],
    ['Patients', 'View all registered patients', '/admin/patients'],
    ['Medicines', 'Manage stock and prices', '/admin/medicines'],
    ['Bills', 'Generate and review bills', '/admin/bills'],
  ],
};

export default function Home() {
  // Day 2 me AuthContext se user lena; abhi localStorage se
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <Navigate to="/login" replace />;

  const items = actions[user.role] || [];

  return (
    <>
      <Navbar />
      <main className="home">
        <div className="wrap">
          <h1>Welcome, {user.name}</h1>
          <p className="lead">Here is what you can do today.</p>
          <div className="actions">
            {items.map(([title, text, to]) => (
              <Link key={to} to={to} className="action">
                <h3>{title}</h3>
                <p>{text}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
