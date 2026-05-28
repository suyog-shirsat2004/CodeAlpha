import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #F0F2F5 0%, #EDE9FE 30%, #E6FFFD 70%, #F0F2F5 100%)' }}>
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(108,92,231,0.08) 0%, transparent 70%)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(0,206,201,0.08) 0%, transparent 70%)' }}></div>
      </div>
      <div className="w-100 position-relative" style={{ maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center gap-2 mb-2">
            <i className="bi bi-grid-3x3-gap-fill" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
            <span className="fw-bold gradient-text" style={{ fontSize: '1.75rem' }}>ProjectFlow</span>
          </div>
          <p className="text-secondary small fw-medium">Sign in to manage your projects</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-4 slide-up" style={{ border: '1px solid var(--border-color)' }}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-100">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center small text-muted mt-3 mb-0">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary text-decoration-none fw-semibold">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
