import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  RiUser3Line,
  RiLockPasswordLine,
  RiShieldCheckLine,
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine
} from 'react-icons/ri';

export default function Profile() {
  const { user, updateUser } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [pinCode, setPinCode] = useState(user?.pinCode || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name,
        phone,
        city,
        state,
        pinCode
      });
      if (res.success && res.data?.user) {
        updateUser(res.data.user);
        toast.success('Profile details saved successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      if (res.success) {
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="py-4">
      <div className="container" style={{ maxWidth: '850px' }}>
        {/* Header */}
        <div className="mb-4">
          <h1 className="fw-bold mb-1">Account & Profile Settings</h1>
          <p className="text-muted mb-0">Manage personal contact details and account security</p>
        </div>

        <div className="row g-4">
          {/* Profile Overview Card */}
          <div className="col-md-4">
            <div className="bg-white p-4 border rounded-3 shadow-sm text-center mb-4">
              <div
                className="rounded-circle text-white d-inline-flex align-items-center justify-content-center fw-bold fs-3 mb-3"
                style={{ width: '80px', height: '80px', backgroundColor: '#0f172a' }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h5 className="fw-bold mb-1">{user?.name}</h5>
              <p className="small text-muted mb-2">{user?.email}</p>

              <div className="d-flex justify-content-center gap-2 mb-3">
                <span className="badge bg-teal text-white text-uppercase px-2 py-1" style={{ backgroundColor: '#0d9488' }}>
                  {user?.role}
                </span>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                  Active Account
                </span>
              </div>

              <div className="small text-muted border-top pt-3 text-start">
                <div className="mb-1">
                  <strong>Phone:</strong> +91 {user?.phone || 'Not provided'}
                </div>
                <div>
                  <strong>Location:</strong> {user?.city ? `${user?.city}, ${user?.state}` : 'India'}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile & Password Forms */}
          <div className="col-md-8">
            {/* Personal Details */}
            <div className="bg-white p-4 border rounded-3 shadow-sm mb-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <RiUser3Line style={{ color: '#0d9488' }} /> Edit Profile Details
              </h5>

              <form onSubmit={handleUpdateProfile}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Full Legal Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Email (Cannot be changed)</label>
                    <input
                      type="email"
                      className="form-control bg-light"
                      value={user?.email || ''}
                      disabled
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Indian Mobile Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-4">
                    <label className="form-label small fw-bold text-muted">City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  <div className="col-4">
                    <label className="form-label small fw-bold text-muted">State</label>
                    <input
                      type="text"
                      className="form-control"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>

                  <div className="col-4">
                    <label className="form-label small fw-bold text-muted">PIN Code</label>
                    <input
                      type="text"
                      className="form-control"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                    />
                  </div>

                  <div className="col-12 text-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn btn-teal btn-sm px-3 py-2 fw-semibold"
                    >
                      {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white p-4 border rounded-3 shadow-sm">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <RiLockPasswordLine style={{ color: '#0d9488' }} /> Change Security Password
              </h5>

              <form onSubmit={handleChangePassword}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label small fw-bold text-muted">New Password (min 6 chars)</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label small fw-bold text-muted">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12 text-end">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="btn btn-primary-navy btn-sm px-3 py-2 fw-semibold"
                    >
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
