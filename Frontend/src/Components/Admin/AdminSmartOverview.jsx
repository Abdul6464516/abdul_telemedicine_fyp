import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BadgeCheck,
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Hospital,
  ShieldAlert,
  Sparkles,
  UserCog,
  UserRoundPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { getAdminOverviewInsights } from '../../services/adminActions';
import './AdminSmartOverview.css';

function AdminSmartOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({});
  const [latestUsers, setLatestUsers] = useState([]);

  const loadInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminOverviewInsights();
      setSummary(data?.summary || {});
      setLatestUsers(Array.isArray(data?.latestUsers) ? data.latestUsers : []);
    } catch (err) {
      setError(err?.message || 'Failed to load admin overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const cards = useMemo(
    () => [
      {
        key: 'totalUsers',
        title: 'Total Users',
        value: summary.totalUsers || 0,
        icon: <Users size={18} />,
        tone: 'users',
      },
      {
        key: 'totalDoctors',
        title: 'Total Doctors',
        value: summary.totalDoctors || 0,
        icon: <Hospital size={18} />,
        tone: 'doctors',
      },
      {
        key: 'totalPatients',
        title: 'Total Patients',
        value: summary.totalPatients || 0,
        icon: <UserCog size={18} />,
        tone: 'patients',
      },
      {
        key: 'pendingVerifications',
        title: 'Pending Verifications',
        value: summary.pendingVerifications || 0,
        icon: <Clock3 size={18} />,
        tone: 'pending',
      },
      {
        key: 'totalAppointments',
        title: 'Total Appointments',
        value: summary.totalAppointments || 0,
        icon: <CalendarRange size={18} />,
        tone: 'appointments',
      },
      {
        key: 'totalConsultations',
        title: 'Total Consultations',
        value: summary.totalConsultations || 0,
        icon: <Activity size={18} />,
        tone: 'consultations',
      },
    ],
    [summary]
  );

  if (loading) {
    return (
      <div className="admin-smart-overview">
        <div className="admin-smart-overview-state">
          <Activity size={18} className="admin-smart-spin" />
          <p>Loading admin overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-smart-overview">
      <div className="admin-smart-header">
        <div className="admin-smart-heading-wrap">
          <div className="admin-smart-badge-icon">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="admin-smart-title">Admin Smart Overview</h2>
            <p className="admin-smart-subtitle">
              Single-screen pulse of platform users, verification load, appointments, and consultations.
            </p>
          </div>
        </div>
        <button type="button" className="admin-smart-refresh-btn" onClick={loadInsights}>
          Refresh
        </button>
      </div>

      {error ? (
        <div className="admin-smart-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="admin-smart-grid">
        {cards.map((card) => (
          <article key={card.key} className={`admin-smart-card tone-${card.tone}`}>
            <div className="admin-smart-card-top">
              <div className="admin-smart-icon">{card.icon}</div>
              <span>{card.title}</span>
            </div>
            <p className="admin-smart-value">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="admin-smart-split-grid">
        <section className="admin-smart-panel">
          <div className="admin-smart-panel-head">
            <h3>Operational Status</h3>
          </div>
          <div className="admin-smart-mini-grid">
            <div className="admin-smart-mini-item">
              <CheckCircle2 size={16} />
              <span>Approved Appointments</span>
              <strong>{summary.approvedAppointments || 0}</strong>
            </div>
            <div className="admin-smart-mini-item">
              <XCircle size={16} />
              <span>Rejected Appointments</span>
              <strong>{summary.cancelledAppointments || 0}</strong>
            </div>
            <div className="admin-smart-mini-item">
              <CalendarClock size={16} />
              <span>Pending Appointments</span>
              <strong>{summary.pendingAppointments || 0}</strong>
            </div>
            <div className="admin-smart-mini-item">
              <BadgeCheck size={16} />
              <span>Verified Users</span>
              <strong>{summary.verifiedUsers || 0}</strong>
            </div>
            <div className="admin-smart-mini-item">
              <ShieldAlert size={16} />
              <span>Rejected Users</span>
              <strong>{summary.rejectedUsers || 0}</strong>
            </div>
            <div className="admin-smart-mini-item">
              <Activity size={16} />
              <span>Completed Consultations</span>
              <strong>{summary.completedConsultations || 0}</strong>
            </div>
          </div>
        </section>

        <section className="admin-smart-panel">
          <div className="admin-smart-panel-head">
            <h3>Latest Five Registrations</h3>
            <span>{latestUsers.length} users</span>
          </div>

          {latestUsers.length === 0 ? (
            <div className="admin-smart-empty">No recent registrations found.</div>
          ) : (
            <div className="admin-smart-user-list">
              {latestUsers.map((user, idx) => (
                <article key={user._id || idx} className="admin-smart-user-item">
                  <div className="admin-smart-user-left">
                    <div className="admin-smart-user-avatar">
                      {(user.fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="admin-smart-user-name">{user.fullName || 'Unknown User'}</p>
                      <p className="admin-smart-user-meta">{user.role || 'user'} | {user.city || 'City N/A'}</p>
                    </div>
                  </div>

                  <div className="admin-smart-user-right">
                    <p className={`admin-smart-status status-${user.verificationStatus || 'pending'}`}>
                      {user.verificationStatus || 'pending'}
                    </p>
                    <p className="admin-smart-date">
                      <UserRoundPlus size={13} />
                      <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Date N/A'}</span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminSmartOverview;
