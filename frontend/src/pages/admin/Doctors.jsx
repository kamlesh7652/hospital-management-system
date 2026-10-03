import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/backend/layout/DashboardLayout';
import DoctorForm from '../../components/backend/doctor/DoctorForm';
import DoctorList from '../../components/backend/doctor/DoctorList';
import '../../components/backend/doctor/Doctor.css';
import {
  fetchDoctors, createDoctor, updateDoctor, deactivateDoctor,
} from '../../api/doctors';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await fetchDoctors();
      setDoctors(data.data);
    } catch (err) {
      setError('Could not load doctors.');
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (form) => {
    setLoading(true);
    setError('');
    try {
      if (editing) {
        await updateDoctor(editing._id, form);
      } else {
        await createDoctor(form);
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doctor) => {
    setEditing({
      _id: doctor._id,
      name: doctor.user?.name || '',
      phone: doctor.user?.phone || '',
      specialization: doctor.specialization,
      qualification: doctor.qualification || '',
      experience: doctor.experience || '',
      consultationFee: doctor.consultationFee,
      availableDays: doctor.availableDays || [],
    });
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this doctor?')) return;
    await deactivateDoctor(id);
    await load();
  };

  return (
    <DashboardLayout>
      <h1>Doctors</h1>
      <p className="lead">Add new doctors or update existing ones.</p>

      {error && <div className="auth-banner error">{error}</div>}

      <DoctorForm
        initial={editing}
        onSubmit={handleSubmit}
        onCancel={() => setEditing(null)}
        loading={loading}
      />

      <DoctorList doctors={doctors} onEdit={handleEdit} onDeactivate={handleDeactivate} />
    </DashboardLayout>
  );
}