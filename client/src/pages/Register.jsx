import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiEyeLine, RiEyeOffLine, RiLockLine, RiMailLine, RiUserLine, RiPhoneLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [role, setRole] = useState('guest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }

    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      setError('Please provide a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    const result = await register({
      name,
      email,
      phone,
      password,
      confirmPassword,
      role,
      city,
      state,
      pinCode,
      termsAccepted
    });
    setLoading(false);

    if (result?.success) {
      if (result.user.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/');
      }
    } else {
      setError(result?.error || 'Registration failed');
    }
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh', backgroundColor: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '560px' }}>
        <div className="text-center mb-4">
          <Link to="/" className="brand-logo justify-content-center mb-2" style={{ fontSize: '1.8rem' }}>
            <span>🏨</span> Stay<span>Sphere</span>
          </Link>
          <h3 className="fw-bold mb-1">Create an Account</h3>
          <p className="text-muted small">Join India's preferred modern hotel booking network</p>
        </div>

        <div className="bg-white p-4 p-sm-5 border rounded-3 shadow-sm">
          {error && <div className="alert alert-danger small py-2 mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Account Type */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Registering As</label>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn btn-sm flex-fill ${role === 'guest' ? 'btn-teal' : 'btn-outline-secondary'}`}
                  onClick={() => setRole('guest')}
                >
                  Guest / Traveller
                </button>
                <button
                  type="button"
                  className={`btn btn-sm flex-fill ${role === 'manager' ? 'btn-teal' : 'btn-outline-secondary'}`}
                  onClick={() => setRole('manager')}
                >
                  Hotel Owner / Manager
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Full Name *</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <RiUserLine />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="e.g. Ananya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="row g-2 mb-3">
              <div className="col-sm-6">
                <label className="form-label small fw-bold text-muted">Email Address *</label>
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

              <div className="col-sm-6">
                <label className="form-label small fw-bold text-muted">Mobile Number (India) *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <RiPhoneLine />
                  </span>
                  <input
                    type="tel"
                    className="form-control border-start-0"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* City, State, PIN */}
            <div className="row g-2 mb-3">
              <div className="col-4">
                <label className="form-label small fw-bold text-muted">City</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Indore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="col-4">
                <label className="form-label small fw-bold text-muted">State</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Madhya Pradesh"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="col-4">
                <label className="form-label small fw-bold text-muted">PIN Code</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="452010"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="row g-2 mb-3">
              <div className="col-sm-6">
                <label className="form-label small fw-bold text-muted">Password (min 6 chars) *</label>
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

              <div className="col-sm-6">
                <label className="form-label small fw-bold text-muted">Confirm Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="form-check mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="termsCheck"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
              />
              <label className="form-check-label small text-muted" htmlFor="termsCheck">
                I agree to the StaySphere Terms of Service, Guest Booking Guidelines, and Privacy Policy.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-teal w-100 py-2 fw-semibold mb-3"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>

            <div className="text-center small text-muted">
              Already have an account?{' '}
              <Link to="/login" className="fw-bold text-teal text-decoration-none" style={{ color: '#0d9488' }}>
                Sign in here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
