import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DoctorSlider from '../components/DoctorSlider';
import '../components/extras.css';

const departments = [
  ['Cardiology', 'Heart and blood pressure'],
  ['Orthopedics', 'Bones, joints and injuries'],
  ['Pediatrics', 'Care for children'],
  ['Gynecology', "Women's health"],
  ['Dermatology', 'Skin, hair and nails'],
  ['General Medicine', 'Fever, infections, check-ups'],
];

const steps = [
  ['Create your account', 'Register once with your phone number and email.'],
  ['Pick a doctor and time', 'Filter by department and choose a free slot.'],
  ['Visit and get everything online', 'Your prescription, records and bill stay in your account.'],
];

export default function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <section className="hero">
          <div className="wrap">
            <div>
              <h1>See the right doctor without the waiting line.</h1>
              <p className="lead">
                Book appointments, keep your medical records and pay bills in one place. No paper files, no repeat visits to the counter.
              </p>
              <div className="hero-cta">
                <Link to="/register" className="btn btn-primary">Book an appointment</Link>
                <a href="#how" className="btn">See how it works</a>
              </div>
            </div>
            <div className="slip" aria-label="Sample appointment token">
              <div className="slip-top"><span>OPD token</span><span>Today</span></div>
              <div className="slip-token">#14</div>
              <div className="slip-doc">Dr. Ananya Rao</div>
              <div className="slip-meta">Cardiology · 10:30 AM · Room 204</div>
              <span className="slip-status">Confirmed</span>
            </div>
          </div>
        </section>

        <section className="stats" aria-label="Hospital in numbers">
          <div className="wrap">
            <div><b>50+</b><span>Specialist doctors</span></div>
            <div><b>12</b><span>Departments</span></div>
            <div><b>10,000+</b><span>Patients served</span></div>
            <div><b>24x7</b><span>Emergency care</span></div>
          </div>
        </section>

        <section className="section" id="doctors">
          <div className="wrap">
            <DoctorSlider />
          </div>
        </section>

        <section className="section" id="departments">
          <div className="wrap">
            <h2>Departments</h2>
            <p className="lead">Choose a department and see which doctors are available today.</p>
            <ul className="dept-list">
              {departments.map(([name, desc]) => (
                <li key={name}><b>{name}</b><span>{desc}</span></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section alt" id="how">
          <div className="wrap">
            <h2>How it works</h2>
            <ul className="steps">
              {steps.map(([title, text]) => (
                <li key={title}><h3>{title}</h3><p>{text}</p></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section" id="roles">
          <div className="wrap">
            <h2>Built for everyone in the hospital</h2>
            <div className="roles">
              <div className="role">
                <h3>Patients</h3>
                <ul><li>Book and cancel appointments</li><li>View records and prescriptions</li><li>Check and pay bills</li></ul>
              </div>
              <div className="role">
                <h3>Doctors</h3>
                <ul><li>See today's appointments</li><li>Add diagnosis and prescription</li><li>Open a patient's history</li></ul>
              </div>
              <div className="role">
                <h3>Admin</h3>
                <ul><li>Manage doctors and patients</li><li>Track medicine stock</li><li>Generate and review bills</li></ul>
              </div>
            </div>
          </div>
        </section>

        <section className="cta">
          <h2>Ready to book your first visit?</h2>
          <p>It takes about two minutes to register.</p>
          <Link to="/register" className="btn">Create an account</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
