import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <nav className="navbar navbar-expand bg-white border-bottom shadow-sm px-3">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary">
          <i className="bi bi-grid-3x3-gap-fill fs-4"></i>
          ProjectFlow
        </Link>

        {user && (
          <div className="d-flex align-items-center gap-3">
            <button onClick={toggleDarkMode} className="btn-ghost p-2 rounded">
              {darkMode ? <i className="bi bi-sun fs-5"></i> : <i className="bi bi-moon fs-5"></i>}
            </button>

            <Link to="/" className="btn-ghost text-decoration-none small fw-medium px-2 py-1 rounded">
              Dashboard
            </Link>

            <div className="d-flex align-items-center gap-2">
              <div className="avatar avatar-initials" style={{ width: '2rem', height: '2rem', fontSize: '.7rem' }}>
                {initials}
              </div>
              <span className="small fw-medium text-secondary d-none d-sm-block">{user.name}</span>
            </div>

            <button onClick={handleLogout} className="btn-danger-ghost p-2 rounded" title="Logout">
              <i className="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
