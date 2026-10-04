import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/backend/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { fetchPatients } from '../api/patientApi';
import { fetchDoctors } from '../api/doctors';// apni file ka sahi naam/path rakhna

// limit: 1 isliye ki sirf total chahiye, poora data nahi
const counters = {
  doctors: () => fetchDoctors(),
  patients: () => fetchPatients({ page: 1, limit: 1 }),
};

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
    ['Doctors', 'Add, edit or remove doctors', '/admin/doctors', 'doctors'],
    ['Patients', 'View all registered patients', '/admin/patients', 'patients'],
    ['Medicines', 'Manage stock and prices', '/admin/medicines'],
    ['Bills', 'Generate and review bills', '/admin/bills'],
  ],
  receptionist: [
    ['Appointments', 'Book or update patient appointments', '/reception/appointments'],
    ['Patients', 'Register and search patients', '/reception/patients', 'patients'],
  ],
  pharmacist: [
    ['Medicines', 'Manage stock and prices', '/pharmacy/medicines'],
    ['Prescriptions', 'View and dispense prescriptions', '/pharmacy/prescriptions'],
  ],
};

export default function Home() {
  const { user } = useAuth();
  const items = actions[user?.role] || [];
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let alive = true;
    items.forEach(async ([, , , key]) => {
      if (!key) return;
      try {
        const { data } = await counters[key]();
        const total = data.total ?? data.data?.length ?? 0;
        if (alive) setCounts((c) => ({ ...c, [key]: total }));
      } catch {
        /* count na aaye to card bina count ke dikhega */
      }
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  return (
    <DashboardLayout>
      <h1>Welcome, {user?.name}</h1>
      <p className="lead">Here is what you can do today.</p>
      <div className="actions">
        {items.map(([title, text, to, key]) => (
          <Link key={to} to={to} className="action">
            <h3>{title}</h3>
            {key && counts[key] !== undefined && (
              <span className="action-count">{counts[key]}</span>
            )}
            <p>{text}</p>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}