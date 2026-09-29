import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Photos: frontend/public/doctors/ me doc1.jpg, doc2.jpg ... rakho
const doctors = [
  { name: 'Dr. Ananya Rao', dept: 'Cardiology', exp: '12 years', img: '/doctors/team.jpg' },
  { name: 'Dr. Rohan Mehta', dept: 'Orthopedics', exp: '9 years', img: '/doctors/team2.jpg' },
  { name: 'Dr. Sneha Kapoor', dept: 'Pediatrics', exp: '8 years', img: '/doctors/team3.jpg' },
  { name: 'Dr. Imran Khan', dept: 'General Medicine', exp: '15 years', img: '/doctors/team.jpg' },
  { name: 'Dr. Priya Nair', dept: 'Dermatology', exp: '7 years', img: '/doctors/team2.jpg' },
  { name: 'Dr. Vikram Singh', dept: 'Gynecology', exp: '11 years', img: '/doctors/team3.jpg' },
];

function Photo({ name, img }) {
  const [failed, setFailed] = useState(false);
  const initials = name.replace('Dr. ', '').split(' ').map((w) => w[0]).join('');
  return failed ? (
    <div className="doc-photo doc-fallback" aria-hidden="true">{initials}</div>
  ) : (
    <img className="doc-photo" src={img} alt={name} loading="lazy" onError={() => setFailed(true)} />
  );
}

export default function DoctorSlider() {
  const track = useRef(null);
  const [paused, setPaused] = useState(false);

  const move = (dir) => {
    const el = track.current;
    if (!el) return;
    const step = el.firstElementChild.offsetWidth + 20;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
    else el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => move(1), 3500);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className="slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="slider-head">
        <div>
          <h2>Meet our doctors</h2>
          <p className="lead">Experienced specialists, available for booking today.</p>
        </div>
        <div className="slider-btns">
          <button className="arrow" onClick={() => move(-1)} aria-label="Previous doctors">‹</button>
          <button className="arrow" onClick={() => move(1)} aria-label="Next doctors">›</button>
        </div>
      </div>

      <div className="slider-track" ref={track}>
        {doctors.map((d) => (
          <article className="doc-card" key={d.name}>
            <Photo name={d.name} img={d.img} />
            <div className="doc-info">
              <h3>{d.name}</h3>
              <p>{d.dept}</p>
              <span className="doc-exp">{d.exp} experience</span>
              <Link to="/register" className="btn btn-primary">Book now</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
