import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  // Day 2 me AuthContext aane par yahan se replace kar dena
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <header className="nav">
      <div className="wrap">
        <Link to="/" className="logo">OHMS</Link>
        {!user && (
          <nav className="nav-links" aria-label="Sections">
            <a href="/#doctors">Doctors</a>
            <a href="/#departments">Departments</a>
            <a href="/#how">How it works</a>
            <a href="/#roles">Who it's for</a>
          </nav>
        )}
        <div className="nav-actions">
          {user ? (
            <>
              <span>{user.name}</span>
              <button className="btn" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn">Log in</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
