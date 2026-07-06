import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  MessageSquare,
  Sparkles,
  UserRound,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import { getMyAppointments, getMyFeedbacks, getMyPrescriptions } from '../../services/patientAction';
import './PatientSmartOverview.css';

const parseDateTime = (dateStr, timeStr) => {
  if (!dateStr) return null;

  const [year, month, day] = String(dateStr).split('-').map(Number);
  if (!year || !month || !day) return null;

  let hours = 0;
  let minutes = 0;
  if (timeStr) {
    const value = String(timeStr).trim().toUpperCase();
    const amPmMatch = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    const twentyFourMatch = value.match(/^(\d{1,2}):(\d{2})$/);

    if (amPmMatch) {
      hours = Number(amPmMatch[1]);
      minutes = Number(amPmMatch[2]);
      const period = amPmMatch[3];
      if (period === 'AM') hours = hours === 12 ? 0 : hours;
      else hours = hours === 12 ? 12 : hours + 12;
    } else if (twentyFourMatch) {
      hours = Number(twentyFourMatch[1]);
      minutes = Number(twentyFourMatch[2]);
    }
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

const statusLabel = {
  pending: 'Pending',
  approved: 'Approved',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const PatientSmartOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const loadInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const [appointmentsData, prescriptionsData, feedbacksData] = await Promise.all([
        getMyAppointments(),
        getMyPrescriptions(),
        getMyFeedbacks(),
      ]);

      setAppointments(Array.isArray(appointmentsData?.appointments) ? appointmentsData.appointments : []);
      setPrescriptions(Array.isArray(prescriptionsData?.prescriptions) ? prescriptionsData.prescriptions : []);
      setFeedbacks(Array.isArray(feedbacksData?.feedbacks) ? feedbacksData.feedbacks : []);
    } catch (err) {
      setError(err?.message || 'Failed to load patient overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const summary = useMemo(() => {
    const now = new Date();
    const upcomingAppointments = appointments.filter((appointment) => {
      const status = String(appointment.status || '').toLowerCase();
      if (!['pending', 'approved'].includes(status)) return false;
      const scheduled = parseDateTime(appointment.date, appointment.time);
      return scheduled ? scheduled >= now : status === 'pending';
    });

    const completedAppointments = appointments.filter((appointment) => appointment.status === 'completed');
    const cancelledAppointments = appointments.filter((appointment) => appointment.status === 'cancelled');
    const averageFeedback = feedbacks.length
      ? Math.round((feedbacks.reduce((sum, item) => sum + Number(item.rating || 0), 0) / feedbacks.length) * 10) / 10
      : 0;

    const nextAppointment = [...appointments]
      .filter((appointment) => ['pending', 'approved'].includes(String(appointment.status || '').toLowerCase()))
      .map((appointment) => ({ ...appointment, _scheduled: parseDateTime(appointment.date, appointment.time) }))
      .filter((appointment) => appointment._scheduled)
      .sort((a, b) => a._scheduled - b._scheduled)[0] || null;

    return {
      totalAppointments: appointments.length,
      upcomingAppointments: upcomingAppointments.length,
      completedAppointments: completedAppointments.length,
      cancelledAppointments: cancelledAppointments.length,
      prescriptionsReceived: prescriptions.length,
      feedbackGiven: feedbacks.length,
      averageFeedback,
      nextAppointment,
    };
  }, [appointments, prescriptions, feedbacks]);

  const latestAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [appointments]);

  const latestPrescriptions = useMemo(() => {
    return [...prescriptions]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [prescriptions]);

  if (loading) {
    return (
      <div className="ps-overview">
        <div className="ps-state">
          <Activity size={18} className="ps-spin" />
          <p>Loading your overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ps-overview">
      <div className="ps-header">
        <div className="ps-header-copy">
          <div className="ps-badge-icon">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="ps-title">Patient Smart Overview</h2>
            <p className="ps-subtitle">
              Your appointments, prescriptions, feedback activity, and next visit in one place.
            </p>
          </div>
        </div>
        <button type="button" className="ps-refresh-btn" onClick={loadInsights}>
          Refresh
        </button>
      </div>

      {error ? (
        <div className="ps-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="ps-grid">
        <article className="ps-card tone-total">
          <div className="ps-card-top">
            <ClipboardList size={18} />
            <span>Total Appointments</span>
          </div>
          <p className="ps-card-value">{summary.totalAppointments}</p>
        </article>
        <article className="ps-card tone-upcoming">
          <div className="ps-card-top">
            <CalendarClock size={18} />
            <span>Upcoming</span>
          </div>
          <p className="ps-card-value">{summary.upcomingAppointments}</p>
        </article>
        <article className="ps-card tone-completed">
          <div className="ps-card-top">
            <CheckCircle2 size={18} />
            <span>Completed</span>
          </div>
          <p className="ps-card-value">{summary.completedAppointments}</p>
        </article>
        <article className="ps-card tone-cancelled">
          <div className="ps-card-top">
            <XCircle size={18} />
            <span>Cancelled</span>
          </div>
          <p className="ps-card-value">{summary.cancelledAppointments}</p>
        </article>
        <article className="ps-card tone-rx">
          <div className="ps-card-top">
            <Stethoscope size={20} color="#fff" />
            <span>Prescriptions</span>
          </div>
          <p className="ps-card-value">{summary.prescriptionsReceived}</p>
        </article>
        <article className="ps-card tone-feedback">
          <div className="ps-card-top">
            <MessageSquare size={18} />
            <span>Feedback</span>
          </div>
          <p className="ps-card-value">{summary.feedbackGiven}</p>
        </article>
      </div>

      <div className="ps-split-grid">
        <section className="ps-panel">
          <div className="ps-panel-head">
            <h3>Next Appointment</h3>
            <span>{summary.nextAppointment ? 'Scheduled' : 'None'}</span>
          </div>

          {summary.nextAppointment ? (
            <div className="ps-next-card">
              <div className="ps-next-avatar">
                <UserRound size={18} />
              </div>
              <div className="ps-next-body">
                <p className="ps-next-doctor">Dr. {summary.nextAppointment.doctor?.fullName || 'Doctor'}</p>
                <p className="ps-next-meta">
                  {summary.nextAppointment.doctor?.specialty || 'Specialist'}
                  {summary.nextAppointment.date ? ` · ${summary.nextAppointment.date}` : ''}
                  {summary.nextAppointment.time ? ` · ${summary.nextAppointment.time}` : ''}
                </p>
                <div className={`ps-status status-${summary.nextAppointment.status || 'pending'}`}>
                  {statusLabel[summary.nextAppointment.status] || 'Pending'}
                </div>
              </div>
            </div>
          ) : (
            <div className="ps-empty">You do not have any upcoming appointments.</div>
          )}
        </section>

        <section className="ps-panel">
          <div className="ps-panel-head">
            <h3>Average Feedback</h3>
            <span>{summary.averageFeedback ? `${summary.averageFeedback}/5` : 'No ratings yet'}</span>
          </div>
          <div className="ps-feedback-summary">
            <div className="ps-feedback-score">{summary.averageFeedback || '0.0'}</div>
            <p>
              Based on {summary.feedbackGiven} review{summary.feedbackGiven === 1 ? '' : 's'} you submitted.
            </p>
          </div>
        </section>
      </div>

      <div className="ps-split-grid">
        <section className="ps-panel">
          <div className="ps-panel-head">
            <h3>Latest Five Appointments</h3>
            <span>{latestAppointments.length} records</span>
          </div>
          {latestAppointments.length === 0 ? (
            <div className="ps-empty">No appointments found.</div>
          ) : (
            <div className="ps-list">
              {latestAppointments.map((appointment) => (
                <article key={appointment._id} className="ps-list-item">
                  <div>
                    <p className="ps-item-title">Dr. {appointment.doctor?.fullName || 'Doctor'}</p>
                    <p className="ps-item-sub">
                      {appointment.date || 'Date N/A'} {appointment.time ? `· ${appointment.time}` : ''}
                    </p>
                  </div>
                  <div className={`ps-chip status-${appointment.status || 'pending'}`}>
                    {statusLabel[appointment.status] || appointment.status || 'Pending'}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="ps-panel">
          <div className="ps-panel-head">
            <h3>Latest Five Prescriptions</h3>
            <span>{latestPrescriptions.length} records</span>
          </div>
          {latestPrescriptions.length === 0 ? (
            <div className="ps-empty">No prescriptions received yet.</div>
          ) : (
            <div className="ps-list">
              {latestPrescriptions.map((rx) => (
                <article key={rx._id} className="ps-list-item">
                  <div>
                    <p className="ps-item-title">Dr. {rx.doctor?.fullName || 'Doctor'}</p>
                    <p className="ps-item-sub">{rx.diagnosis || 'Prescription issued'}</p>
                  </div>
                  <div className="ps-chip status-completed">{rx.status || 'viewed'}</div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PatientSmartOverview;
