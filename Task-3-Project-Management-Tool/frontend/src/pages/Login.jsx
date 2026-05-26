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
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #fff 50%, #f5f3ff 100%)' }}>
      <div className="w-100" style={{ maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <i className="bi bi-grid-3x3-gap-fill text-primary" style={{ fontSize: '2rem' }}></i>
            <span className="fw-bold text-primary" style={{ fontSize: '1.75rem' }}>ProjectFlow</span>
          </div>
          <p className="text-muted small">Sign in to manage your projects</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-4">
          <div className="mb-3">
            <label className="form-label small fw-medium text-secondary">Email</label>
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
            <label className="form-label small fw-medium text-secondary">Password</label>
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
            <Link to="/register" className="text-primary text-decoration-none fw-medium">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
