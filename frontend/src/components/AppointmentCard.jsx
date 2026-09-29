import { Link } from 'react-router-dom';

const depts = ['Cardiology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Dermatology', 'General Medicine'];

export default function AppointmentCard() {
  return (
    <form className="appt-card" onSubmit={(e) => e.preventDefault()}>
      <h3>Book an appointment</h3>
      <label>
        Department
        <select defaultValue="">
          <option value="" disabled>Select department</option>
          {depts.map((d) => <option key={d}>{d}</option>)}
        </select>
      </label>
      <label>
        Preferred date
        <input type="date" />
      </label>
      <label>
        Phone number
        <input type="tel" placeholder="98765 43210" />
      </label>
      <Link to="/register" className="btn btn-primary appt-submit">Check availability</Link>
      <p className="appt-note">You'll confirm the exact slot after registering.</p>
    </form>
  );
}
