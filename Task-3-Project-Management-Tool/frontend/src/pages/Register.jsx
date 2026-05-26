import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <p className="text-muted small">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-4">
          <div className="mb-3">
            <label className="form-label small fw-medium text-secondary">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              placeholder="John Doe"
              required
            />
          </div>

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
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-medium text-secondary">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control"
              placeholder="Repeat your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-100">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center small text-muted mt-3 mb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-primary text-decoration-none fw-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
