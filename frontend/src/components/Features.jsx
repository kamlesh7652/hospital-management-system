const features = [
  ['🩺', 'Expert doctors', 'Verified specialists across 12 departments.'],
  ['⏱', 'Quick booking', 'Get a confirmed slot in under two minutes.'],
  ['📄', 'Digital records', 'Prescriptions and reports, always in your account.'],
  ['🚑', '24x7 emergency', 'Round-the-clock care when it matters most.'],
];

export default function Features() {
  return (
    <section className="section why">
      <div className="wrap">
        <div className="why-grid">
          {features.map(([icon, title, text]) => (
            <div className="why-card" key={title}>
              <span className="why-icon">{icon}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
