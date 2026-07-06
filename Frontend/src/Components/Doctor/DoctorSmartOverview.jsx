import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Stethoscope,
  UserX,
  Users,
  AlertCircle,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { getDoctorDashboardInsights } from '../../services/doctorAction';
import './DoctorSmartOverview.css';

const statusLabelMap = {
  pending: 'Pending',
  approved: 'Approved',
  cancelled: 'Rejected',
  completed: 'Completed',
};

function DoctorSmartOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    approvedAppointments: 0,
    rejectedAppointments: 0,
    completedAppointments: 0,
    totalConsultations: 0,
    totalPatients: 0,
  });
  const [latestPatients, setLatestPatients] = useState([]);

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDoctorDashboardInsights();
      setSummary(data?.summary || {});
      setLatestPatients(Array.isArray(data?.latestPatients) ? data.latestPatients : []);
    } catch (err) {
      setError(err.message || 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const cards = useMemo(
    () => [
      {
        key: 'totalAppointments',
        title: 'Total Appointments',
        value: summary.totalAppointments || 0,
        icon: <CalendarCheck size={20} />,
        tone: 'all',
      },
      {
        key: 'pendingAppointments',
        title: 'Pending',
        value: summary.pendingAppointments || 0,
        icon: <Clock3 size={20} />,
        tone: 'pending',
      },
      {
        key: 'approvedAppointments',
        title: 'Approved',
        value: summary.approvedAppointments || 0,
        icon: <CheckCircle2 size={20} />,
        tone: 'approved',
      },
      {
        key: 'rejectedAppointments',
        title: 'Rejected',
        value: summary.rejectedAppointments || 0,
        icon: <UserX size={20} />,
        tone: 'rejected',
      },
      {
        key: 'totalConsultations',
        title: 'Total Consultations',
        value: summary.totalConsultations || 0,
        icon: <Stethoscope size={20} />,
        tone: 'consultation',
      },
      {
        key: 'totalPatients',
        title: 'Total Patients',
        value: summary.totalPatients || 0,
        icon: <Users size={20} />,
        tone: 'patients',
      },
    ],
    [summary]
  );

  if (loading) {
    return (
      <div className="doctor-smart-overview">
        <div className="doctor-smart-overview-state">
          <Activity size={18} className="doctor-smart-overview-spin" />
          <p>Loading smart overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-smart-overview">
      <div className="doctor-smart-overview-header">
        <div className="doctor-smart-overview-heading-wrap">
          <div className="doctor-smart-overview-badge-icon">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="doctor-smart-overview-title">Smart Doctor Overview</h2>
            <p className="doctor-smart-overview-subtitle">
              Live glance of your appointments, consultation load, and recent patients.
            </p>
          </div>
        </div>
        <button className="doctor-smart-overview-refresh-btn" onClick={fetchInsights} type="button">
          Refresh
        </button>
      </div>

      {error ? (
        <div className="doctor-smart-overview-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="doctor-smart-overview-metric-grid">
        {cards.map((card) => (
          <article key={card.key} className={`doctor-smart-overview-metric-card tone-${card.tone}`}>
            <div className="doctor-smart-overview-metric-top">
              <div className="doctor-smart-overview-metric-icon">{card.icon}</div>
              <span className="doctor-smart-overview-metric-title">{card.title}</span>
            </div>
            <p className="doctor-smart-overview-metric-value">{card.value}</p>
          </article>
        ))}
      </div>

      <section className="doctor-smart-overview-patients-panel">
        <div className="doctor-smart-overview-panel-head">
          <h3>Latest Five Patients</h3>
          <span>{latestPatients.length} records</span>
        </div>

        {latestPatients.length === 0 ? (
          <div className="doctor-smart-overview-empty">No recent patient activity found.</div>
        ) : (
          <div className="doctor-smart-overview-patient-list">
            {latestPatients.map((patient, idx) => (
              <article key={patient._id || idx} className="doctor-smart-overview-patient-card">
                <div className="doctor-smart-overview-patient-left">
                  <div className="doctor-smart-overview-patient-avatar">
                    {(patient.fullName || 'P').trim().charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="doctor-smart-overview-patient-name">{patient.fullName || 'Unknown Patient'}</p>
                    <p className="doctor-smart-overview-patient-meta">
                      {patient.age ? `${patient.age} yrs` : 'Age N/A'}
                      {patient.gender ? ` | ${patient.gender}` : ''}
                    </p>
                  </div>
                </div>

                <div className="doctor-smart-overview-patient-right">
                  <p className="doctor-smart-overview-visit">
                    {patient.lastAppointmentDate || 'No Date'}
                    {patient.lastAppointmentTime ? `, ${patient.lastAppointmentTime}` : ''}
                  </p>
                  <p className="doctor-smart-overview-status-chip status-${patient.lastAppointmentStatus || 'pending'}">
                    {statusLabelMap[patient.lastAppointmentStatus] || 'Pending'}
                  </p>
                  <p className="doctor-smart-overview-city">
                    <MapPin size={13} />
                    <span>{patient.city || 'City N/A'}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DoctorSmartOverview;
