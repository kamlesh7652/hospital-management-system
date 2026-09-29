export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <span>© {new Date().getFullYear()} OHMS – Online Hospital Management System</span>
        <span>Emergency? Call <b>112</b></span>
      </div>
    </footer>
  );
}
