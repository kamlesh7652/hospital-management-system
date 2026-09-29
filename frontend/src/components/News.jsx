const posts = [
  ['🧠', 'Health', 'Five habits that lower your blood pressure naturally', 'General Medicine'],
  ['🍎', 'Nutrition', 'What to eat before and after a minor surgery', 'General Medicine'],
  ['🩺', 'Checkups', 'Why yearly full-body checkups catch problems early', 'Cardiology'],
];

export default function News() {
  return (
    <section className="section">
      <div className="wrap">
        <h2>Health tips & news</h2>
        <p className="lead">Short reads from our doctors, updated regularly.</p>
        <div className="news-grid">
          {posts.map(([icon, tag, title, dept]) => (
            <article className="news-card" key={title}>
              <span className="news-icon">{icon}</span>
              <span className="news-tag">{tag}</span>
              <h3>{title}</h3>
              <span className="news-dept">{dept}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
