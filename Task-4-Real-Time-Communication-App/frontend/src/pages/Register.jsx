import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineVideoCamera } from 'react-icons/hi';

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
    if (!name || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      if (!err.response) {
        toast.error('Backend not reachable — run the backend locally for full features');
      } else {
        toast.error(err.response?.data?.message || 'Registration failed');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-indigo-400 mb-2">
            <HiOutlineVideoCamera className="w-8 h-8" />
            <span>ConnectHub</span>
          </div>
          <p className="text-gray-400">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="John Doe" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="At least 6 characters" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" placeholder="Repeat your password" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating account...' : 'Create Account'}</button>
          <p className="text-center text-sm text-gray-400">Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Register;
