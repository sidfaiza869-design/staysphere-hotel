import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  RiShieldCheckLine,
  RiGroupLine,
  RiHotelLine,
  RiCalendarCheckLine,
  RiMoneyDollarCircleLine,
  RiBarChartLine,
  RiSearchLine,
  RiCheckLine,
  RiCloseLine
} from 'react-icons/ri';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const PIE_COLORS = ['#0d9488', '#0f172a', '#e11d48', '#f59e0b', '#6366f1'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Users filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, hotelsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/hotels')
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data?.users || []);
      if (hotelsRes.success) setHotels(hotelsRes.data?.hotels || []);
    } catch (err) {
      toast.error('Failed to load admin metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.success) {
        toast.success(res.message || 'Role updated');
        await loadAdminData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user role');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`);
      if (res.success) {
        toast.success(res.message || 'Status updated');
        await loadAdminData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  const handleUpdateApproval = async (hotelId, status) => {
    try {
      const res = await api.patch(`/admin/hotels/${hotelId}/approval`, { status });
      if (res.success) {
        toast.success(`Hotel ${status}`);
        await loadAdminData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update approval');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch =
      !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="py-4">
      <div className="container">
        {/* Header */}
        <div className="mb-4">
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle text-uppercase mb-1">
            Super Administrator Portal
          </span>
          <h1 className="fw-bold mb-1">StaySphere Platform Administration</h1>
          <p className="text-muted mb-0">System metrics, real-time revenue analytics, user governance, and hotel moderation</p>
        </div>

        {/* Navigation Tabs */}
        <div className="d-flex gap-2 border-bottom pb-2 mb-4">
          <button
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-teal' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('overview')}
          >
            <RiBarChartLine className="me-1" /> Analytics & Trends
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'users' ? 'btn-teal' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            <RiGroupLine className="me-1" /> User Governance ({users.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'hotels' ? 'btn-teal' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('hotels')}
          >
            <RiHotelLine className="me-1" /> Properties & Moderation ({hotels.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#0d9488' }} role="status"></div>
            <div className="mt-2 text-muted small">Loading system records...</div>
          </div>
        ) : (
          <>
            {/* 1. Overview & Recharts Analytics */}
            {activeTab === 'overview' && (
              <div>
                {/* 4 Stat Metric Cards */}
                <div className="row g-3 mb-4">
                  <div className="col-lg-3 col-6">
                    <div className="p-3 bg-white border rounded-3 shadow-sm">
                      <div className="small text-muted fw-bold text-uppercase mb-1">Total Users</div>
                      <h3 className="fw-bold mb-0 text-dark">{stats?.users?.total || 0}</h3>
                      <div className="small text-muted">
                        {stats?.users?.guests || 0} Guests • {stats?.users?.managers || 0} Managers
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-6">
                    <div className="p-3 bg-white border rounded-3 shadow-sm">
                      <div className="small text-muted fw-bold text-uppercase mb-1">Hotel Properties</div>
                      <h3 className="fw-bold mb-0 text-dark">{stats?.hotels?.total || 0}</h3>
                      <div className="small text-muted">
                        {stats?.hotels?.approved || 0} Approved • {stats?.hotels?.pending || 0} Pending
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-6">
                    <div className="p-3 bg-white border rounded-3 shadow-sm">
                      <div className="small text-muted fw-bold text-uppercase mb-1">Reservations</div>
                      <h3 className="fw-bold mb-0 text-teal" style={{ color: '#0d9488' }}>
                        {stats?.bookings?.total || 0}
                      </h3>
                      <div className="small text-muted">
                        {stats?.bookings?.confirmed || 0} Confirmed • {stats?.bookings?.cancelled || 0} Cancelled
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-6">
                    <div className="p-3 bg-white border rounded-3 shadow-sm">
                      <div className="small text-muted fw-bold text-uppercase mb-1">Verified Revenue</div>
                      <h3 className="fw-bold mb-0 text-dark">
                        {formatINR(stats?.revenue?.totalRevenuePaise || 0)}
                      </h3>
                      <div className="small text-muted">Excludes refunds & cancelled</div>
                    </div>
                  </div>
                </div>

                {/* Recharts Analytics Section */}
                <div className="row g-4 mb-4">
                  {/* Revenue Growth Trend Chart */}
                  <div className="col-lg-8">
                    <div className="bg-white border rounded-3 p-4 shadow-sm h-100">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">Platform Revenue Trend (INR)</h5>
                        <span className="badge bg-light text-muted border">6-Month Trend</span>
                      </div>
                      <div style={{ width: '100%', height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats?.analytics?.bookingTrends || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                            <Area
                              type="monotone"
                              dataKey="revenue"
                              stroke="#0d9488"
                              fill="#ccfbf1"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Top Indian Destinations Bar Chart */}
                  <div className="col-lg-4">
                    <div className="bg-white border rounded-3 p-4 shadow-sm h-100">
                      <h5 className="fw-bold mb-3">Top Destinations</h5>
                      <div style={{ width: '100%', height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats?.analytics?.destinationStats || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="bookingsCount" fill="#0f172a" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. User Governance Tab */}
            {activeTab === 'users' && (
              <div className="bg-white border rounded-3 p-4 shadow-sm">
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light border-end-0">
                        <RiSearchLine />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search users by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <select
                      className="form-select form-select-sm"
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                    >
                      <option value="all">All User Roles</option>
                      <option value="guest">Guest</option>
                      <option value="manager">Hotel Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover table-custom small mb-0">
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Email Address</th>
                        <th>Mobile</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th className="text-end">Role Governance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u._id}>
                          <td className="fw-bold">{u.name}</td>
                          <td>{u.email}</td>
                          <td>+91 {u.phone || 'N/A'}</td>
                          <td>
                            <span
                              className={`badge text-uppercase ${
                                u.role === 'admin'
                                  ? 'bg-danger text-white'
                                  : u.role === 'manager'
                                  ? 'bg-primary text-white'
                                  : 'bg-secondary text-white'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                u.accountStatus === 'active'
                                  ? 'bg-success-subtle text-success border border-success-subtle'
                                  : 'bg-danger-subtle text-danger border border-danger-subtle'
                              }`}
                            >
                              {u.accountStatus}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-1">
                              <select
                                className="form-select form-select-sm"
                                style={{ width: '110px' }}
                                value={u.role}
                                onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                              >
                                <option value="guest">Guest</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                              </select>

                              <button
                                onClick={() => handleToggleUserStatus(u._id)}
                                className={`btn btn-sm ${
                                  u.accountStatus === 'active'
                                    ? 'btn-outline-danger'
                                    : 'btn-outline-success'
                                }`}
                              >
                                {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Properties Tab */}
            {activeTab === 'hotels' && (
              <div className="bg-white border rounded-3 p-4 shadow-sm">
                <div className="table-responsive">
                  <table className="table table-hover table-custom small mb-0">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>City / State</th>
                        <th>Category</th>
                        <th>Starting Rate</th>
                        <th>Approval</th>
                        <th>Active Status</th>
                        <th className="text-end">Moderation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotels.map((h) => (
                        <tr key={h._id}>
                          <td>
                            <div className="fw-bold">{h.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              {h.locality}
                            </div>
                          </td>
                          <td>
                            {h.city}, {h.state}
                          </td>
                          <td>
                            <span className="badge-tag text-uppercase">{h.hotelType}</span>
                          </td>
                          <td className="fw-semibold">{formatINR(h.startingPricePaise)}</td>
                          <td>
                            <span
                              className={`badge text-uppercase ${
                                h.approvalStatus === 'approved'
                                  ? 'bg-success-subtle text-success'
                                  : h.approvalStatus === 'rejected'
                                  ? 'bg-danger-subtle text-danger'
                                  : 'bg-warning-subtle text-warning'
                              }`}
                            >
                              {h.approvalStatus}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                h.isActive ? 'bg-success-subtle text-success' : 'bg-secondary'
                              }`}
                            >
                              {h.isActive ? 'Live' : 'Deactivated'}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-1">
                              {h.approvalStatus !== 'approved' && (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleUpdateApproval(h._id, 'approved')}
                                >
                                  Approve
                                </button>
                              )}
                              {h.approvalStatus !== 'rejected' && (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleUpdateApproval(h._id, 'rejected')}
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
