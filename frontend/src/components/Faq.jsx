import { useState } from 'react';

const items = [
  ['Do I need to visit the hospital to book?', 'No. Register once online, then book any department\u2019s available slot from your account.'],
  ['Can I cancel or reschedule an appointment?', 'Yes, from "My appointments" up to a few hours before your slot, at no extra charge.'],
  ['Will I get my prescription online?', 'Yes. After your visit, the doctor\u2019s diagnosis and prescription appear in "My records".'],
  ['How do I pay my bill?', 'Bills generated after a visit or medicine purchase show up under "My bills" with their status.'],
];

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section alt">
      <div className="wrap faq-wrap">
        <div>
          <h2>Frequently asked questions</h2>
          <p className="lead">Everything you need to know before your first visit.</p>
        </div>
        <div className="faq-list">
          {items.map(([q, a], i) => (
            <div className={`faq-item${open === i ? ' open' : ''}`} key={q}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                {q}<span>{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <p className="faq-a">{a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
