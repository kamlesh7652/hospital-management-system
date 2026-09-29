import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-rich">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <h4>OHMS</h4>
            <p>Book appointments, view records and pay bills online — all in one hospital account.</p>
          </div>
          <div>
            <h4>Quick links</h4>
            <a href="/#departments">Departments</a>
            <a href="/#doctors">Doctors</a>
            <a href="/#how">How it works</a>
          </div>
          <div>
            <h4>For patients</h4>
            <Link to="/register">Register</Link>
            <Link to="/login">Log in</Link>
            <a href="/#roles">Who it's for</a>
          </div>
          <div>
            <h4>Contact</h4>
            <p>📞 +91 98765 43210</p>
            <p>✉ care@ohms.in</p>
            <p>Emergency: 112</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} OHMS – Online Hospital Management System</span>
          <span>Emergency? Call <b style={{color:'#fff'}}>112</b></span>
        </div>
      </div>
    </footer>
  );
}
