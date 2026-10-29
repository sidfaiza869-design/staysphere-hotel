import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiEyeLine, RiEyeOffLine, RiLockLine, RiMailLine, RiShieldUserLine } from 'react-icons/ri';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result?.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else if (result.user.role === 'manager') {
        navigate('/manager');
      } else {
        navigate(redirectPath);
      }
    } else {
      setError(result?.error || 'Invalid email or password');
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh', backgroundColor: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <Link to="/" className="brand-logo justify-content-center mb-2" style={{ fontSize: '1.8rem' }}>
            <span>🏨</span> Stay<span>Sphere</span>
          </Link>
          <h3 className="fw-bold mb-1">Welcome Back</h3>
          <p className="text-muted small">Sign in to manage bookings, reviews, and properties</p>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="bg-white p-3 border rounded-3 shadow-sm mb-3">
          <div className="small fw-bold text-uppercase text-muted mb-2 d-flex align-items-center gap-1">
            <RiShieldUserLine className="text-teal" /> 1-Click Demo Accounts:
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm flex-fill"
              onClick={() => handleQuickLogin('guest@staysphere.com', 'Guest@123')}
            >
              Demo Guest
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm flex-fill"
              onClick={() => handleQuickLogin('manager@staysphere.com', 'Manager@123')}
            >
              Demo Manager
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm flex-fill"
              onClick={() => handleQuickLogin('admin@staysphere.com', 'Admin@123')}
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white p-4 p-sm-5 border rounded-3 shadow-sm">
          {error && <div className="alert alert-danger small py-2 mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <RiMailLine />
                </span>
                <input
                  type="email"
                  className="form-control border-start-0"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold text-muted mb-0">Password</label>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <RiLockLine />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-group-text bg-light text-muted border-start-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary-navy w-100 py-2 fw-semibold mb-3"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div className="text-center small text-muted">
              Don't have an account yet?{' '}
              <Link to="/register" className="fw-bold text-teal text-decoration-none" style={{ color: '#0d9488' }}>
                Register here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
