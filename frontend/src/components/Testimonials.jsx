import { useEffect, useRef } from 'react';

const reviews = [
  ['I got an appointment the same evening I booked. No waiting in line at all.', 'Meera J.', 'Patient, Cardiology'],
  ['Being able to see my prescription and past visits online has been a huge relief.', 'Arjun P.', 'Patient, Orthopedics'],
  ['The booking flow is simple even for my parents to use.', 'Kavya S.', 'Patient, General Medicine'],
];

export default function Testimonials() {
  const track = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      const el = track.current;
      if (!el) return;
      const step = el.firstElementChild.offsetWidth + 20;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + step, behavior: 'smooth' });
    }, 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="section alt">
      <div className="wrap">
        <h2>What patients say</h2>
        <div className="testi-track" ref={track}>
          {reviews.map(([quote, name, role]) => (
            <blockquote className="testi-card" key={name}>
              <p>“{quote}”</p>
              <footer><b>{name}</b><span>{role}</span></footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
